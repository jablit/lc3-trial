class NotesController < ApplicationController

	before_action :set_note, only: [:destroy, :update]
  
	def create
		@note = Note.new note_params
		@note.save
	end

	def destroy
		head :ok
	end

	def update
		@note.assign_attributes note
		@note.save
	end

	private

	def note_params
    params.require(:note).permit([:text, :quote, :start_offset, :start_container_index, :end_offset, :end_container_index])
  end  

  def set_note
    @note = Note.find(params[:id])
  end

end