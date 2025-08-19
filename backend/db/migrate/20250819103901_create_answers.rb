class CreateAnswers < ActiveRecord::Migration[8.0]
  def change
    create_table :answers do |t|
      t.string :question_id
      t.string :status
      t.integer :score
      t.text :transcript

      t.timestamps
    end
  end
end
