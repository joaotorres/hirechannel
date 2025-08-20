class Api::JobDescriptionsController < ApplicationController
  before_action :set_job_description, only: [:show, :update, :destroy]

  def index
    job_descriptions = JobDescription.active.select(:id, :title, :description, :active, :created_at)
    render json: job_descriptions
  end

  def show
    render json: @job_description
  end

  def create
    # Deactivate all existing job descriptions first
    JobDescription.update_all(active: false)
    
    job_description = JobDescription.new(job_description_params)
    
    if job_description.save
      render json: job_description, status: :created
    else
      render json: { errors: job_description.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @job_description.update(job_description_params)
      render json: @job_description
    else
      render json: { errors: @job_description.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @job_description.update(active: false)
    render json: { message: "Job description deactivated successfully" }
  end

  def current
    current_jd = JobDescription.current
    if current_jd
      render json: current_jd.slice(:id, :title, :description, :active, :created_at)
    else
      render json: { error: "No active job description found" }, status: :not_found
    end
  end

  private

  def set_job_description
    @job_description = JobDescription.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Job description not found" }, status: :not_found
  end

  def job_description_params
    params.require(:job_description).permit(:title, :description, :active)
  end
end
