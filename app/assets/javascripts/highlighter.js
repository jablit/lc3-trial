$(function () {

	var $text = $('#text p');

	function getRange(selection) {
		if (selection.getRangeAt) {
    	var range = selection.getRangeAt(0);
    } else { 
    	// safari
      var range = document.createRange();
      range.setStart(selection.anchorNode, selection.anchorOffset);
      range.setEnd(selection.focusNode, selection.focusOffset);
    }

    return range;
	}

	function getSelection() {
		if (window.getSelection) {
    	return window.getSelection();
    } else if (document.selection) { 
    	// opera
      return document.selection.createRange();
    }
	}

	function createLitRange(note) {
		var opts = {};
		
		opts.note = note;
		opts.range = document.createRange();
		opts.startContainerIndex = note.startContainerIndex;
		opts.endContainerIndex = note.endContainerIndex;
		opts.range.setStart($text.get(note.startContainerIndex).childNodes[0], note.startOffset);
		opts.range.setEnd($text.get(note.endContainerIndex).childNodes[0], note.endOffset);

		return new LitRange(opts);
	}

	function convertUnderscoreToCamelCase(obj) {
		var new_obj = {};
		for (var i in obj) {
			new_obj[i.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); })] = obj[i];
		}
		return new_obj;
	}

	function convertCamelCaseToUnderscore(obj) {
		var new_obj = {};
		for (var i in obj) {
			new_obj[i.split(/(?=[A-Z])/).join('_').toLowerCase()] = obj[i];
		}
		return new_obj;
	}

	function openNoteModal(note) {
		var is_new = note && note.id ? false : true;
		
    BootstrapDialog.show({
    	cssClass: 'note-dialog',
	    title: is_new ? 'Edit Note' : 'Create Note',
	    message: '<blockquote class="blockquote">' + note.quote + '</blockquote><textarea class="form-control notes">' + (note.text || '') + '</textarea>',
	    onshown: function (dialog) {
      	dialog.$modalContent.find('textarea').focus();
      },
	    buttons: [
	      {
	        label: 'Cancel',
	        action: function (dialog) {
	        	if (is_new) {
	        		removeHighlight(note);
	        	}
	        	dialog.close();
	        }
	      }, 
	      {
	        label: 'Save',
	        cssClass: 'btn-primary',
	        action: function (dialog) {
	        	note.text = dialog.$modalContent.find('textarea').val();
	        	note.lit_guide_id = $("#lit_guide_id").val();
	        	
	        	$.ajax({
	        		data: {note: convertCamelCaseToUnderscore(note)},
	        		method: is_new ? 'POST' : 'PUT',
	        		url: is_new ? '/notes' : '/notes/' + note.id,
	        	}).done(function (data) { 
	        		$('.sidebar-notes').html(data);
	        		$('#note-saved-banner').data('note', note).fadeIn();
	        	});

	        	dialog.close();
	        }
	      }
	    ]
    });
	}

	function removeHighlight(note) {
		$('.' + convertUnderscoreToCamelCase(note).cssId).contents().unwrap();
	}

	/**
	* Mouseup Touchend Event Handler
	*/
	$text.on('mouseup touchend', function (e) {
		if ($(e.target).hasClass('highlighted')) {
			return;
		}

		// get selection
		var opts = {};
		var selection = getSelection();
		opts.range = getRange(selection);
		opts.startContainerIndex = $text.index(selection.anchorNode.parentElement);
		opts.endContainerIndex = $text.index(selection.focusNode.parentElement);

		var lit_range = new LitRange(opts);
		$('.' + lit_range.note.cssId).first().click(); // open the note modal

		// we've captured all the data we need, so let's remove the selection
		selection.removeAllRanges();
	});
	
	/**
	* Highlighted Phrase Click Handler
	*/
	$(document).on('click', '.highlighted', function () {
		openNoteModal($(this).data('note'));
	});

	/**
	* Edit Note Handler
	*/ 
	$(document).on('click', '.edit-note', function () {
		openNoteModal($(this).parent().data('note'));
	});

	/**
	* Delete Note Handler
	*/ 
	$(document).on('click', '.delete-note', function () {
		var $parent = $(this).parent();
		var note = $parent.data('note');
		
  	$.ajax({
  		method: 'DELETE',
  		url: '/notes/' + note.id + '.json',
  	}).done(function (data) { 
  		$parent.fadeOut();
  		setTimeout(function () {
  			removeHighlight(note);
  		}, 200);
  	});
	});

	/**
	* Load notes/highlights from sidebar
	*/
	jQuery.fn.reverse = [].reverse;
	$('.note-sidebar').reverse().each(function () {
		createLitRange(convertUnderscoreToCamelCase($(this).data('note')));
	});

	/**
	* Note Saved Banner click to scroll handler
	*/
	$('#note-saved-banner').on('click', function () {
		var note = $(this).data('note');
		var $sidebar_note = $('.note-sidebar[data-id="' + note.cssId + '"]');
		$('html, body').animate({scrollTop: $sidebar_note.offset().top});
	});

});