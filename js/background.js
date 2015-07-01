/**
 * background.js is loaded once per browser instance. acts as the handler from
 * page.js and dispatcher to contentscript.js
 */

var manifest = chrome.runtime.getManifest();

if (chrome.runtime.onInstalled) {
	chrome.runtime.onInstalled.addListener(function() {
		Settings.save(Settings.DEFAULT);
	});

};

// Because Twitter always here, all requests to insert tweets go here
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	console.log("background.js: " + JSON.stringify(request));

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

	if (type == "background.loadTweets") {

		var collectionId = request.id;
		Twitter.call("timelines_timeline", {
			id : collectionId
		}, function(response) {
			sendResponse(response);
		});

		// allow async callback of sendResponse()
		return true;

	}
	
	if (type == "background.embedTweets") {
		var tweetIds = request.ids;
		Twitter.embedTweets(tweetIds, function(content){
			sendResponse({content: content});
		});
		
		// allow async callback of sendResponse()
		return true;

	}

});

chrome.webNavigation.onCompleted.addListener(function(details) {
	console.log('loaded page: ' + details.url);
	
	function openSidebar(tabId, url, callback){
		chrome.tabs.sendMessage(
				//Selected tab id
				tabId,
				//Params inside a object data
				{action: "openSidebar", url: url}, 
				//Optional callback function
				callback
			);
	}
	
	openSidebar(details.tabId, details.url, function(response) { 
		console.log(response);
	});
});	

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
