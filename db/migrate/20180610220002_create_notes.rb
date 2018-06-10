class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.integer :start_container_index
      t.integer :start_offset
      t.integer :end_container_index
      t.integer :end_offset
      t.text :quote
      t.text :text
      t.references :lit_guide, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
