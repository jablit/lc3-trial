class LitRange {

	constructor(range) {
		this.TEXT_NODE = 3;
		this.DOCUMENT_POSITION_FOLLOWING = 4;
		this.DOCUMENT_POSITION_CONTAINED_BY = 16;

    this.range = range;
    this.startContainer = range.startContainer;
    this.endContainer = range.endContainer;
		this.startOffset = range.startOffset;
		this.endOffset = range.endOffset;

    // ignore selection if it only contains whitespace (also ignore collapsed selections)
    if (this.containsOnlyWhiteSpace()) {
    	return;
    }

		console.log('range good, proceed with highlighting...', this);

		this.highlight();
	}

	containsOnlyWhiteSpace() {
		return !this.toString().match(/[^ \t\r\n]/)
	}

	createSpan() {
	  var span = document.createElement('span');
	  span.className = 'highlighted';
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

	highlight() {
		this.split();
		this.wrap();
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