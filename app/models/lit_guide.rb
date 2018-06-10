class LitGuide < ActiveRecord::Base

	has_many :notes, -> { order 'created_at desc' }

end