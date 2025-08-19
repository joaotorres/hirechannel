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

    # Transcribe using OpenAI Whisper
    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"]) 
    transcript_text = nil

    begin
      response = client.audio.transcriptions(parameters: {
        model: "whisper-1",
        file: downloaded,
        response_format: "text"
      })
      transcript_text = response
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
      eval_response = client.chat(parameters: {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an interview evaluator. Score answers from 1 to 5. Return only the number." },
          { role: "user", content: <<~PROMPT }
            Evaluate the following interview answer transcript for quality, relevance, structure, and clarity.
            Return only an integer score between 1 and 5.

            Transcript:
            #{transcript_text}
          PROMPT
        ],
        temperature: 0
      })

      content = eval_response.dig("choices", 0, "message", "content").to_s.strip
      numeric_score = content[/\d+/].to_i.clamp(1, 5)
      answer.update!(score: numeric_score, status: "completed")
      Rails.logger.info("Answer ##{answer.id} scored: #{numeric_score}")
    rescue => e
      Rails.logger.error("Evaluation failed: #{e.message}")
      answer.update!(status: "failed")
    end
  end
end
