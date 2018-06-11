class LitRange {

	constructor(opts) {
    var opts = opts || {};
    
		this.TEXT_NODE = 3;
		this.DOCUMENT_POSITION_FOLLOWING = 4;
		this.DOCUMENT_POSITION_CONTAINED_BY = 16;

    this.range = opts.range;
    this.note = opts.note || {text: ''};
    this.startContainerIndex = opts.startContainerIndex;
    this.endContainerIndex = opts.endContainerIndex;
    this.startContainer = this.range.startContainer;
    this.endContainer = this.range.endContainer;
    this._startOffset = this.range.startOffset;
    this._endOffset = this.range.endOffset;
		this.startOffset = this.range.startOffset;
		this.endOffset = this.range.endOffset;
    
    // ignore selection if it only contains whitespace (also ignore collapsed selections)
    if (this.containsOnlyWhiteSpace()) {
    	return;
    }

		this.highlight();
	}

	containsOnlyWhiteSpace() {
		return !this.toString().match(/[^ \t\r\n]/)
	}

	createSpan() {
	  var span = document.createElement('span');
    var note = this.prepareNote();
    span.dataset.note = JSON.stringify(note);
    span.className = this.cssId();
	  span.className += ' highlighted';
    return span;
  }

	getNodes() {
		var nodes = new Array([]);
    var node = this.startContainer;
    var parentNode = node.parentNode;
    var position = this.startContainer.compareDocumentPosition(this.endContainer);
    var i = 0;

    while (position == 0 || (position & this.DOCUMENT_POSITION_FOLLOWING)) {
      if (position & this.DOCUMENT_POSITION_CONTAINED_BY) {
        node = node.firstChild;
      }
      else {
        // new node position, need a new span
        if (parentNode != node.parentNode) {
          i++;
          nodes[i] = [];
          parentNode = node.parentNode;
        }

        nodes[i].push(node);
        node = this.getSiblingOrParentNode(node, 'next');
        
        if (position == this.DOCUMENT_POSITION_CONTAINED_BY) {
          break;
        }
      }

      position = node.compareDocumentPosition(this.endContainer);
    }

    return nodes;
	}

	getSiblingOrParentNode(node, order) {
    var sibling = order + 'Sibling';

    if (node[sibling]) {
      return node[sibling];
    }
    else if (node.parentNode) {
      return this.getSiblingOrParentNode(node.parentNode, order);
    }
    else {
      return null;
    }
	}

  cssId() {
    return 'highlight' + this._startOffset + '_' + this._endOffset + '_' + this.startContainerIndex + '_' + this.endContainerIndex;
  }

	highlight() {
		this.split();
		this.wrap();
	}

  prepareNote() {
    this.note.cssId = this.cssId();
    this.note.startOffset = this._startOffset;
    this.note.endOffset = this._endOffset;
    this.note.startContainerIndex = this.startContainerIndex;
    this.note.endContainerIndex = this.endContainerIndex;
    this.note.quote = this.toString().replace(/\./g, '. '); // add a space after each period to account for multi-line selections
    return this.note;
  }

	split() {
		// handle startContainer
		if (this.startContainer.nodeType == this.TEXT_NODE && this.startOffset > 0) {
			var splitContainer = this.startContainer.splitText(this.startOffset);
        
      // if same node, ensure they reference same container node
			if (this.startContainer == this.endContainer) {
				this.endContainer = splitContainer;
				this.endOffset = this.endOffset - this.startContainer.length;
			}
      
      this.startContainer = splitContainer;
      this.startOffset = 0;
		}

		// handle endContainer
    if (this.endContainer.nodeType == this.TEXT_NODE && this.endOffset < this.endContainer.length) {
      this.endContainer.splitText(this.endOffset);
      this.endOffset = this.endContainer.length;
    }
	}

	toString() {
		return this.range.toString();
	}

	wrap() {
    var nodes = this.getNodes();
    var textNodeFilter = function () {
      if (this.nodeType != this.TEXT_NODE) {
        return false;
      }
      return $.trim(this.textContent).length > 0;
    };

    for (var i = 0, ilen = nodes.length; i < ilen; i++) {
      if (!nodes[i][0]) {
        // nothing to wrap
        continue;
      }

      for (var j = 0, jlen = nodes[i].length; j < jlen; j++) {
        var node = nodes[i][j];
        var all_nodes = $(node).find('*').add($(node)).contents().add($(node));

        // filter out anything that isn't a text node, then wrap it
        all_nodes.filter(textNodeFilter).wrap(this.createSpan());
      }
    }
	}

};