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
//		if (!this.isOpen){
//			this.isOpen = true;
			
			// create new sidebar
//			var sidebar = document.createElement('div');
//			sidebar.id = "mySidebar";
			
			// use existing sidebar
			sidebar = document.getElementById('watch7-sidebar');
			console.log("sidebar: " + sidebar)
			
//			sidebar.innerHTML = '\
//				<blockquote class="twitter-tweet" lang="en" cards="hidden"><p lang="en" dir="ltr">Well... He just did it... Shia LaBeouf Freestyle Rapping <a href="http://t.co/l67jnbWLOh">http://t.co/l67jnbWLOh</a></p>&mdash; Blake Brooks (@fakeblakebrooks) <a href="https://twitter.com/fakeblakebrooks/status/615728556673359872">June 30, 2015</a></blockquote>\
//				<blockquote class="twitter-tweet" lang="en" cards="hidden"><p lang="en" dir="ltr">Yoooo tryna get Shia on the next album thooooo <a href="http://t.co/wZWHKrVEVD">http://t.co/wZWHKrVEVD</a> <a href="https://twitter.com/hashtag/GalaxyBoi?src=hash">#GalaxyBoi</a></p>&mdash; Galaxykat (@galaxykatmusic) <a href="https://twitter.com/galaxykatmusic/status/615723897682571264">June 30, 2015</a></blockquote>\
//				<script language="JavaScript1.2">twttr.widgets.load()</script>\
//				\
//		';
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
			
//		}
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
	
	window.top.listenerLoaded = true;

	Sidebar.init();
	
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
		console.log(request.action)
		if (request.action == "showTweets") {
			var tweets = request.content; 
			
			console.log(tweets);
			
			var sidebar = Sidebar.open(request);
			console.log(sidebar);
			
			sidebar.innerHTML = tweets;

		}
	});
	
	console.log('contentscript.js: loaded');

}



console.log('loaded script.js')