class Api::AnswersController < ApplicationController
  def index
    answers = Answer.order(created_at: :desc).select(:id, :question_id, :status, :score, :transcript, :created_at)
    render json: answers
  end

  def show
    answer = Answer.find_by(id: params[:id])
    if answer
      render json: answer.slice(:id, :question_id, :status, :score, :transcript, :created_at)
    else
      render json: { error: "Answer not found" }, status: :not_found
    end
  end

  def create
    unless params[:video].present? && params[:questionId].present?
      render json: { error: "Missing required parameters: video, questionId" }, status: :bad_request and return
    end

    answer = Answer.create!(question_id: params[:questionId], status: "queued")
    answer.video.attach(params[:video])

    ProcessAnswerJob.perform_later(answer.id)

    render json: { id: answer.id }, status: :accepted
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue StandardError => e
    Rails.logger.error("Error creating answer: #{e.message}")
    render json: { error: "Internal server error" }, status: :internal_server_error
  end
end
