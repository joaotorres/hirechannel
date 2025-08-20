Rails.application.routes.draw do
  namespace :api do
    resources :questions, only: [:index, :show, :create, :update, :destroy]
    resources :answers, only: [:create, :index, :show]
    get 'job_descriptions/current', to: 'job_descriptions#current'
    resources :job_descriptions, only: [:index, :show, :create, :update, :destroy]
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  # Sidekiq dashboard
  require "sidekiq/web"
  mount Sidekiq::Web => "/sidekiq"
end
