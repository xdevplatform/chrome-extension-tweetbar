/**
 * contentscript.js handles only requests to modify the DOM.
 * 
 * menu items are initialized in background.js
 */

var Sidebar = {
		
	DOM_ID: "my_sidebar",
	sidebar: null,
	isOpen: false,
	
	CSS_COMMON: "\
		position:fixed;\
		top:0px;\
		right:0px;\
		width:325px;\
		height:100%;\
		padding:8px;\
		background:white;\
		border-left: 2px solid #999;\
		z-index:9999999999;\
		overflow:scroll;\
	",
	
	init : function(){
		
	},
		
	open : function(request) {
			
		if (!Sidebar.sidebar){

			// create new sidebar
			var sidebar = document.createElement('div');
			sidebar.id = Sidebar.DOM_ID;
				
			Sidebar.sidebar = sidebar;
			document.body.appendChild(Sidebar.sidebar);
			
		}
		
		Sidebar.sidebar.style.cssText = Sidebar.CSS_VISIBLE;
		Sidebar.isOpen = true;
		
		return Sidebar.sidebar;
	},
	
	close : function(request) {
		
		if (Sidebar.sidebar){
			Sidebar.sidebar.style.cssText = Sidebar.CSS_HIDDEN;
		}
		
		Sidebar.isOpen = false;
		
	},
	
	toggle : function(request) {
		if (Sidebar.isOpen) {
			this.close(request);
		} else {
			this.open(request);
		}
	}
}

Sidebar.CSS_VISIBLE = Sidebar.CSS_COMMON + "display:block;";
Sidebar.CSS_HIDDEN = Sidebar. CSS_COMMON + "display:none;";

//prevent IFRAMES from loading this listener multiple times.
if (!window.top.listenerLoaded) {
	
	console.log('listener loading');
	
	window.top.listenerLoaded = true;

	Sidebar.init();
	
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
		
		console.log('onMessage: ' + request.action)
		
		if (request.action == "showTweets") {

			var tweets = request.content; 
			var html = tweets + Twitter.SCRIPT_TAG;
			
			var sidebar = Sidebar.open(request);
			sidebar.innerHTML = html;

		}
		
		if (request.action == "toggleSidebar") {

			Sidebar.toggle(request);

		}
	});
	
	console.log('contentscript.js: loaded ('+(new Date()).getTime()+')');

}

