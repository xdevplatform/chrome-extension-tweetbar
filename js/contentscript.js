/**
 * contentscript.js handles only requests to modify the DOM.
 * 
 * menu items are initialized in background.js
 */

var Sidebar = {
		
	isOpen: false,
	
	init : function(){
		
	},
		
	open : function(params) {
		if (!this.isOpen){
			this.isOpen = true;
			
			// create new sidebar
//			var sidebar = document.createElement('div');
//			sidebar.id = "mySidebar";
			
			// use existing sidebar
			var sidebar = document.getElementById('watch7-sidebar');
			
			sidebar.innerHTML = '\
				<blockquote class="twitter-tweet" lang="en" cards="hidden"><p lang="en" dir="ltr">Well... He just did it... Shia LaBeouf Freestyle Rapping <a href="http://t.co/l67jnbWLOh">http://t.co/l67jnbWLOh</a></p>&mdash; Blake Brooks (@fakeblakebrooks) <a href="https://twitter.com/fakeblakebrooks/status/615728556673359872">June 30, 2015</a></blockquote>\
				<blockquote class="twitter-tweet" lang="en" cards="hidden"><p lang="en" dir="ltr">Yoooo tryna get Shia on the next album thooooo <a href="http://t.co/wZWHKrVEVD">http://t.co/wZWHKrVEVD</a> <a href="https://twitter.com/hashtag/GalaxyBoi?src=hash">#GalaxyBoi</a></p>&mdash; Galaxykat (@galaxykatmusic) <a href="https://twitter.com/galaxykatmusic/status/615723897682571264">June 30, 2015</a></blockquote>\
				<script language="JavaScript1.2">twttr.widgets.load()</script>\
				\
		';
//			sidebar.style.cssText = "\
//				position:fixed;\
//				top:50px;\
//				right:0px;\
//				width:30%;\
//				height:100%;\
//				padding:8px;\
//				background:white;\
//				z-index:999999;\
//			";

			// document.body.appendChild(sidebar);
		}
	},
	
	close : function(params) {
		var el = document.getElementById('mySidebar');
		el.parentNode.removeChild(el);
		this.isOpen = false;
	},
	
	toggle : function(params) {
		if (this.isOpen) {
			this.close(params);
		} else {
			this.open(params);
		}
	}
}

var HTML = {
		
	insertTextAtPosition : function(txt) {

		var found = false;
		var focusEl = window.top.document;
		var failSafe = 0;
		var parent = window;

		var text = txt;
		var html = null;

		while (false === found) {

			// has an active element so need to keep searching, ie in a frame
			if (focusEl.activeElement) {

				// set next focusEl
				focusEl = focusEl.activeElement;

				if (focusEl instanceof HTMLIFrameElement) {

					parent = focusEl.contentDocument;
					focusEl = focusEl.contentDocument;

				}

				// found iframe in design mode
				if (focusEl.designMode == 'on' || focusEl.contentEditable) {

					// no need to carry on
					found = true;

				}

			}
			// no more active elements so we can stop
			else {

				found = true;

			}

			failSafe++;

			// failsafe in case something went wrong to prevent infinite loop
			if (failSafe > 100) {
				found = true;
				alert('Sorry, couldn\'t find target to insert text into.');
				return false;
			}

		}

		// design mode editor
		if (focusEl.designMode == 'on') {
			console.log('designmode');

			if (!html) {
				// replace line breaks with <br/> tags
				text = text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
						'$1<br/>$2');
			}

			// insert
			focusEl.execCommand('insertHtml', false, text);

		}
		// input, textarea
		else if (focusEl.tagName.toLowerCase() == 'input'
				|| focusEl.tagName.toLowerCase() == 'textarea') {
			console.log('input');
			// get start and end position of caret
			var startPos = focusEl.selectionStart;
			var endPos = focusEl.selectionEnd;

			// insert text
			focusEl.value = focusEl.value.substring(0, startPos) + text
					+ focusEl.value.substring(endPos, focusEl.value.length);

			// update caret position
			focusEl.setSelectionRange(startPos + text.length, startPos
					+ text.length);

		}
		// if content editable
		else if (focusEl.contentEditable) {
			console.log('contentEditable');
			// get selection
			var selection = parent.getSelection();
			var range = selection.getRangeAt(0);

			range.deleteContents();

			// get text
			if (html) {
				var div = document.createElement('div');
				div.innerHTML = text;
				range.insertNode(div);
			} else {
				var text = text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
						'$1<br/>$2');
				var texts = text.split('<br/>');

				// insert
				for ( var i = texts.length - 1; i >= 0; i--) {
					range.insertNode(document.createTextNode(texts[i]));
					if (i > 0) {
						range.insertNode(document.createElement('br'));
					}
				}
			}
			range.collapse(true);
			range.detach();

		}

	},
	
}

//prevent IFRAMES from loading this listener multiple times.
if (!window.top.listenerLoaded) {
	
	window.top.listenerLoaded = true;
	
	chrome.extension.onMessage.addListener(function(request, sender,
			sendResponse) {

		console.log('contentscript.js: ' + JSON.stringify(request));

		var type = request.type;
		
		if (type == "contentscript.insertTextAtPosition") {
			var text = request.content;
			HTML.insertTextAtPosition(text);
			
			sendResponse({});
		}
		
		// allow async callback of sendResponse()
		return true;
		
	});
	
	Sidebar.init();
	
	console.log('contentscript.js: loaded');

}

//var js = '<script async src="" charset="utf-8"></script>';
//document.getElementsByTagName('head')[0].appendChild(js)
var script = document.createElement('script');
script.src = "//platform.twitter.com/widgets.js";
script.addEventListener('load', function() {
// SomeObject is available!!!
});
document.head.appendChild(script);

/*Handle requests from background.html*/
function handleRequest(
	//The object data with the request params
	params, 
	//These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
	sender, sendResponse
	) {
	console.log(params.action + " " + params.url)
	if (params.action == "toggleSidebar")
		Sidebar.toggle(params);
	if (params.action == "openSidebar")
		Sidebar.open(params);
	if (params.action == "closeSidebar")
		Sidebar.close(params);
}
chrome.extension.onMessage.addListener(handleRequest);

var QueryString = {

	encode : function(obj) {
		var str = [];
		for ( var p in obj) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		}
		return str.join("&");
	},

	parse : function(str) {
		var query = {};
		var a = str.split('&');
		for ( var i in a) {
			var b = a[i].split('=');
			query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
		}

		return query;
	},
	
	get : function(name, _default){
		var value = _default;
		var search = window.location.search;
		if (search.length > 0) {
			search = search.substring(1);
			var qs = QueryString.parse(search);
			if (qs[name]) {
				value = qs[name];
			}
		}
		return value;
	}

}

console.log('loaded script.js')