class CreateJobDescriptions < ActiveRecord::Migration[8.0]
  def change
    create_table :job_descriptions do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end
    
    add_index :job_descriptions, :active
  end
end
