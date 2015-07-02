/**
 * contentscript.js handles only requests to modify the DOM.
 * 
 * menu items are initialized in background.js
 */

var Sidebar = {
		
	isOpen: false,
	sidebar: null,
	
	init : function(){
		
	},
		
	open : function(request) {
			
		// create new sidebar
		var sidebar = document.createElement('div');
		sidebar.id = "mySidebar";
		document.body.appendChild(sidebar);
			
		sidebar.style.cssText = "\
			position:fixed;\
			top:50px;\
			right:0px;\
			width:30%;\
			height:100%;\
			padding:8px;\
			background:white;\
			border-left: 2px solid #999;\
			z-index:999999;\
			overflow:scroll;\
		";
		
		// use existing sidebar
//		sidebar = document.getElementById('watch7-sidebar');
//		console.log("sidebar: " + sidebar)
			
		return sidebar;
	},
	
	close : function(request) {
		var el = document.getElementById('mySidebar');
		el.parentNode.removeChild(el);
		this.isOpen = false;
	},
	
	toggle : function(request) {
		if (this.isOpen) {
			this.close(request);
		} else {
			this.open(request);
		}
	}
}

//prevent IFRAMES from loading this listener multiple times.
if (!window.top.listenerLoaded) {
	
	console.log('listener loading');
	
	window.top.listenerLoaded = true;

	Sidebar.init();
	
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
		
		console.log('onMessage: ' + request.action)
		
		if (request.action == "showTweets") {
			var tweets = request.content; 
			
//			var html = tweets + Twitter.SCRIPT_TAG;
			var html = tweets + Twitter.SCRIPT_TAG2;
			
			var sidebar = Sidebar.open(request);
			console.log(sidebar);
			
			sidebar.innerHTML = html;
			console.log(html);

		}
	});
	
	console.log('contentscript.js: loaded ('+(new Date()).getTime()+')');

}

