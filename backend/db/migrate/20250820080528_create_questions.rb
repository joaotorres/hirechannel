class CreateQuestions < ActiveRecord::Migration[8.0]
  def change
    create_table :questions do |t|
      t.string :text, null: false
      t.text :prompt, null: false
      t.integer :order, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end
    
    add_index :questions, :order, unique: true
    add_index :questions, :active
  end
end
