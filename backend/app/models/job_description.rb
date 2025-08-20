class JobDescription < ApplicationRecord
  validates :title, presence: true, length: { minimum: 5, maximum: 200 }
  validates :description, presence: true, length: { minimum: 20, maximum: 2000 }
  
  scope :active, -> { where(active: true) }
  
  def self.current
    active.first
  end
end
