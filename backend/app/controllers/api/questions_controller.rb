class Api::QuestionsController < ApplicationController
  before_action :set_question, only: [:show, :update, :destroy]

  def index
    questions = Question.active.select(:id, :text, :prompt, :order, :active)
    render json: questions
  end

  def show
    render json: @question
  end

  def create
    question = Question.new(question_params)
    
    if question.save
      render json: question, status: :created
    else
      render json: { errors: question.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @question.update(question_params)
      render json: @question
    else
      render json: { errors: @question.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @question.update(active: false)
    render json: { message: "Question deactivated successfully" }
  end

  private

  def set_question
    @question = Question.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Question not found" }, status: :not_found
  end

  def question_params
    params.require(:question).permit(:text, :prompt, :order, :active)
  end
end
