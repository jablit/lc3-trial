class NotesController < ApplicationController

	before_action :set_note, only: [:destroy, :update]
  
	def create
		@note = Note.new note_params
		@note.save
		@notes = @note.lit_guide.notes

		render 'sidebar_notes', :layout => false
	end

	def destroy
		@note.destroy
		head :no_content
	end

	def update
		@note.assign_attributes note
		@note.save
	end

	private

	def note_params
    params.require(:note).except(:css_id).permit([:text, :quote, :start_offset, :start_container_index, :end_offset, :end_container_index, :lit_guide_id])
  end  

  def set_note
    @note = Note.find(params[:id])
  end

end