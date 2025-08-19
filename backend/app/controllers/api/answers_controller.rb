class Api::AnswersController < ApplicationController
  def create
    unless params[:video].present? && params[:questionId].present?
      render json: { error: "Missing required parameters: video, questionId" }, status: :bad_request and return
    end

    answer = Answer.create!(question_id: params[:questionId], status: "queued")
    answer.video.attach(params[:video])

    ProcessAnswerJob.perform_later(answer.id)

    render json: { id: answer.id }, status: :accepted
  end
end
