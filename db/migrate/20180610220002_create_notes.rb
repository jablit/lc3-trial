class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.integer :startContainerIndex
      t.integer :startOffset
      t.integer :endContainerIndex
      t.integer :endOffset
      t.text :quote
      t.text :notes
      t.references :lit_guide, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
