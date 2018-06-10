$(function () {

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

	function createHighlight(highlight) {
		var range = document.createRange();

		range.setStart($text.get(highlight.startContainerIndex).childNodes[0], highlight.startOffset);
		range.setEnd($text.get(highlight.endContainerIndex).childNodes[0], highlight.endOffset);

		var lit_range = new LitRange(range);
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
		console.log('is_new', is_new);
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
	        	dialog.close();
	        }
	      }, 
	      {
	        label: 'Save',
	        cssClass: 'btn-primary',
	        action: function (dialog) {
	        	note.text = dialog.$modalContent.find('textarea').val();
	        	console.log('you clicked save?', note);

	        	$.ajax({
	        		data: {note: convertCamelCaseToUnderscore(note)},
	        		method: is_new ? 'POST' : 'PUT',
	        		url: (is_new ? '/notes' : '/notes/' + note.id) + '.json',
	        	}).done(function (data) { 
	        		console.log('save note has returned!', data);
	        		note = convertUnderscoreToCamelCase(data);
	        		console.log('note is now', note);
	        	});

	        	dialog.close();
	        }
	      }
	    ]
    });
	}

	/**
	* Mouseup Touchend Event Handler
	*/
	var $text = $('#text p');
	$text.on('mouseup touchend', function () {
		console.log('mouseup/touchend');

		// get selection
		var selection = getSelection();
		var range = getRange(selection);

		//console.log($text.index(selection.anchorNode.parentElement), $text.index(selection.focusNode.parentElement), range.startOffset, range.endOffset);

		var lit_range = new LitRange(range);//.startContainer, range.endContainer, range.startOffset, range.endOffset);
  	//console.log('lit_range', lit_range);

		// we've captured all the data we need, so let's remove the selection
		selection.removeAllRanges();
	});
	
	/**
	* Highlighted Phrase Click Handler
	*/
	$(document).on('click', '.highlighted', function () {
		var $this = $(this);

		console.log('you clicked a highlighted element...', $this.data('note'));

		openNoteModal($this.data('note'));
	});

	// http://localhost:3000/lit-guides/9
	// var highlights = [
	// 	{
	// 		startContainerIndex: 3,
	// 		endContainerIndex: 4,
	// 		startOffset: 99,
	// 		endOffset: 26
	// 	},
	// 	{
	// 		startContainerIndex: 6,
	// 		endContainerIndex: 6,
	// 		startOffset: 114,
	// 		endOffset: 207
	// 	}
	// ]

	// for (var i = 0, ilen = highlights.length; i < ilen; i++) {
	// 	createHighlight(highlights[i]);
	// }

});