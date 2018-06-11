class Note < ActiveRecord::Base

  belongs_to :lit_guide

  def css_id
  	"highlight#{start_offset}_#{end_offset}_#{start_container_index}_#{end_container_index}"
  end

end