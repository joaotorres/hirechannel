require "shellwords"

class ProcessAnswerJob < ApplicationJob
  queue_as :default

  def perform(answer_id)
    answer = Answer.find_by(id: answer_id)
    return unless answer

    answer.update!(status: "processing")

    # Download the attached video to a tempfile
    file = answer.video
    raise "No video attached" unless file.attached?

    downloaded = Tempfile.new(["video", File.extname(file.filename.to_s)])
    downloaded.binmode
    downloaded.write(file.download)
    downloaded.rewind

    # Transcribe using OpenAI (extract audio from video via ffmpeg, then send to Whisper)
    transcript_text = nil

    begin
      client = OpenAI::Client.new
      input_path = Pathname.new(downloaded.path)
      audio_io = nil
      begin
        # Extract mono 16kHz WAV using ffmpeg
        tmp_wav = Tempfile.new(["audio", ".wav"]) ; tmp_wav.close
        wav_path = tmp_wav.path
        system_ok = system("ffmpeg -y -i #{Shellwords.escape(input_path.to_s)} -vn -ac 1 -ar 16000 -f wav #{Shellwords.escape(wav_path)} > /dev/null 2>&1")
        raise "ffmpeg not found or failed to extract audio" unless system_ok && File.size?(wav_path)

        audio_io = File.open(wav_path, "rb")
        file_part = OpenAI::FilePart.new(audio_io, filename: "audio.wav", content_type: "audio/wav")
        response = client.audio.transcriptions.create(
          file: file_part,
          model: "whisper-1",
          response_format: :json
        )
        transcript_text = response.respond_to?(:text) ? response.text.to_s : response.to_s
      ensure
        audio_io&.close
        File.delete(wav_path) rescue nil
      end
    rescue => e
      Rails.logger.error("Transcription failed: #{e.message}")
      answer.update!(status: "failed")
      return
    ensure
      downloaded.close!
    end

    answer.update!(transcript: transcript_text)

    # Evaluate with GPT to get a score 1-5
    begin
      client = OpenAI::Client.new
      eval_response = client.chat.completions.create(
        model: "gpt-4o-mini",
        messages: [
          { role: :system, content: "You are an interview evaluator. Return only an integer from 1 to 5." },
          { role: :user, content: <<~PROMPT }
            Evaluate the following interview answer transcript for quality, relevance, structure, and clarity.
            Return only an integer score between 1 and 5.

            Transcript:
            #{transcript_text}
          PROMPT
        ],
        temperature: 0
      )

      choices = eval_response.respond_to?(:choices) ? eval_response.choices : eval_response.to_h[:choices]
      message = choices&.first&.message
      content = if message.respond_to?(:content)
        message.content.to_s
      elsif message.is_a?(Hash)
        message[:content].to_s
      else
        choices&.first&.to_s || ""
      end
      numeric_score = content[/\d+/].to_i.clamp(1, 5)
      answer.update!(score: numeric_score, status: "completed")
      Rails.logger.info("Answer ##{answer.id} scored: #{numeric_score}")
    rescue => e
      Rails.logger.error("Evaluation failed: #{e.message}")
      answer.update!(status: "failed")
    end
  end
end
