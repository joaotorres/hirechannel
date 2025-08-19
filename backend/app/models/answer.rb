class Answer < ApplicationRecord
  has_one_attached :video

  enum :status, {
    queued: "queued",
    processing: "processing",
    completed: "completed",
    failed: "failed"
  }, validate: false
end
