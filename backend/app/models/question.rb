class Question < ApplicationRecord
  validates :text, presence: true, length: { minimum: 10, maximum: 500 }
  validates :prompt, presence: true, length: { minimum: 10, maximum: 1000 }
  validates :order, presence: true, numericality: { only_integer: true, greater_than: 0 }
  
  default_scope { order(:order) }
  
  scope :active, -> { where(active: true) }
end
