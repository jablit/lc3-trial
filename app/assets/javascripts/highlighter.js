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

	var $text = $('#text p');
	
	$(document).on('mouseup touchend', function () {
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

	var highlights = [
		{
			startContainerIndex: 3,
			endContainerIndex: 4,
			startOffset: 99,
			endOffset: 26
		},
		{
			startContainerIndex: 6,
			endContainerIndex: 6,
			startOffset: 114,
			endOffset: 207
		}
	]

	for (var i = 0, ilen = highlights.length; i < ilen; i++) {
		createHighlight(highlights[i]);
	}

	console.log('highlighter...');

});