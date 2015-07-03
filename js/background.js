/**
 * background.js is loaded once per browser instance. acts as the handler from
 * page.js and dispatcher to contentscript.js
 */

var manifest = chrome.runtime.getManifest();

if (chrome.runtime.onInstalled) {
	chrome.runtime.onInstalled.addListener(function() {
		Settings.save(Settings.DEFAULT);
	});

	// Put page action icon on all tabs
	chrome.tabs.onUpdated.addListener(function(tabId) {
		chrome.pageAction.show(tabId);
	});

	chrome.tabs.getSelected(null, function(tab) {
		chrome.pageAction.show(tab.id);
	});

	// Send request to current tab when page action is clicked
	chrome.pageAction.onClicked.addListener(function(tab) {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendMessage(
				tab.id,
				{action: "toggleSidebar"}, 
				function(response) {
					console.log(response);
				}
			);
		});
	});
};

// Because Twitter always here, all requests to insert tweets go here
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	var type = request.type;

	if (type == "background.twitterRequestToken") {

		Twitter.requestToken(function (auth_url) {
            // Create window to allow auth and get pin
			chrome.tabs.create({
				"url" : auth_url
			});
			
			// unused, but notifies UI to change state
			sendResponse({ success : true });
        });
		
		// allow async callback of sendResponse()
		return true;

	}
	
	if (type == "background.twitterAccessToken") {

		pin = request.pin;
		
		Twitter.accessToken(pin, function (accessToken, accessTokenSecret) {

			if (accessToken && accessTokenSecret){

				var properties = {
						 'accessToken' : accessToken, 
						 'accessTokenSecret' : accessTokenSecret
					}
					
				Settings.save(properties, function(){
					// after success, call Twitter.init to set user
					
					Twitter.init(function(){
						sendResponse({ success : true, status : "Authentication saved." });
					}, function(){
						sendResponse({ success : false, status : "Invalid PIN. Please refresh and try again." });
					});
				});
				
			} else {
				
				sendResponse({ success : false, status : "Invalid PIN. Please refresh and try again." });
				
			}
			
        });
		
		// allow async callback of sendResponse()
		return true;

	}
	
	if (type == "background.reloadSettings") {

		init();
		sendResponse({});
		
		// allow async callback of sendResponse()
		return true;

	}

});

chrome.webRequest.onCompleted.addListener(function(details) {
	
	function showTweets(tabId, content, targetId, callback){
		chrome.tabs.sendMessage(
			//Selected tab id
			tabId,
			//Params inside a object data
			{action: "showTweets", content: content, targetId: targetId}, 
			//Optional callback function
			callback
		);
		
		console.log('showTweets: ('+(new Date()).getTime()+')');
	}
	
	var token = null;


	if (details.url.indexOf(URL.YOUTUBE_WATCH) != -1){

		var qsStart = details.url.indexOf("?");
		var qs = QueryString.parse(details.url.substring(qsStart + 1));
		token = qs['v'];

	} else if (details.type == 'main_frame'){

		var el = document.createElement("a");
		el.href = details.url;
		token = el.hostname;
		
	}

	if (token){

		console.log('search token: ' + token + " (" + details.url + ")");

		token = token + " -liked -filter:retweets lang:en"
		
		Twitter.search(token, function(ids){
		
			Twitter.oembedTweets(ids, function(content){
				
				setTimeout(function(){
					showTweets(details.tabId, content, null, function(response) { 
						console.log(response);
					});
				}, 3000);

			});
		});
	}
		
},
{urls: ["<all_urls>"]},
["responseHeaders"]);	

function init(){
	Settings.init(function(){
		console.log("Settings.init complete");
		Twitter.init(function() {
			console.log("Twitter.init complete");
		}, function() {
			URL.open("settings");
		});
	}, function() {
		URL.open("settings");
	});

}

init();
