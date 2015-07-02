var Settings = {

	// set to false for development
	ONLINE : true,
	
	UI_TIMEOUT : 2000,
		
	PROXY : 'https://stage.birdops.com/',
	API_KEY : 'GQyCKJBmiufakgJ7P5T1eAsxV',
	API_SECRET : 'Hmwv71tVYpHOSOrNT7w0WGdb71JG5Wgxcfo3Gn2qDlhmbtWs2w',
//	ACCESS_TOKEN : null,
//	ACCESS_TOKEN_SECRET : null,
	ACCESS_TOKEN : '54256387-TFUcMqAJdEMDWjyMOmsXMhyi4B95cxakSfF3aQ6tv',
	ACCESS_TOKEN_SECRET : 'd45FxNmL5NiVsO5EWzZhPECmqEycAwSMO5Jk8jebGBqbR',
	
	AUTH_STATE_LOGIN : 'login',
	AUTH_STATE_PIN : 'pin',
	AUTH_STATE_COMPLETED : 'completed',
		
	PROPERTIES : [ 'apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret', 'authState',
			'embedTheme', 'embedShowMedia', 'embedShowConversation', 'embedIncludeScriptTag' ],
			
			
	properties : {},
			
	init : function(success, failure) {
		
		chrome.storage.sync.get(this.PROPERTIES, function(properties) {
			Settings.properties = properties;
			success(properties);
		});

	},

	save : function(properties, callback) {
		
		chrome.storage.sync.set(properties, function() {
			for (var key in properties) {
				Settings.properties[key] = properties[key];
			}
			if (callback){
				callback();
			}
		});

	},
	
	remove : function(properties, callback) {

		chrome.storage.sync.remove(properties, function() {
			for (var key in properties) {
				delete Settings.properties[key];
			}
			if (callback){
				callback();
			}
		});

	}

}

var Twitter = {
		
	NEWLINE : '\n',

	SCRIPT_TAG : '<img src="https://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif" onload="\
		window.twttr = (function(d, s, id) {\
		  var js, fjs = d.getElementsByTagName(s)[0],\
		    t = window.twttr || {};\
		  js = d.createElement(s);\
		  js.id = id;\
		  js.src = \'https://platform.twitter.com/widgets.js\';\
		  fjs.parentNode.insertBefore(js, fjs);\
		  t._e = [];\
		  t.ready = function(f) {\
		    t._e.push(f);\
		  };\
		  return t;\
		}(document, \'script\', \'twitter-wjs\'));\
		\" />',

	cb : null,
	user : null,

	init : function(success, failure) {

		if (!Settings.ONLINE){
			Twitter.user = {}
			success();
		}
		
		if (!Twitter.cb){
			Twitter.cb = new Codebird();
			Twitter.cb.setUseProxy(false);
			// Twitter.cb.setProxy(Settings.PROXY);
			Twitter.cb.setConsumerKey(Settings.API_KEY, Settings.API_SECRET);
		}
		
		if (!Twitter.user) {

			var properties = Settings.properties;

			var accessToken = properties['accessToken'];
			var accessTokenSecret = properties['accessTokenSecret'];

			if (accessToken && accessTokenSecret) {

				Twitter.cb.setToken(accessToken, accessTokenSecret);

				// do something here to verify it's good
				Twitter.cb.__call("account_verifyCredentials", {},
						function(result) {

							if (result && result.id) {
								
								Twitter.user = result;
								
								if (success) {
									success();
								}
							} else {
								if (failure) {
									failure();
								}
							}

						});

			} else {

				if (failure) {
					failure();
				}
			}

		} else {
			success();
		}
	},
	
	requestToken : function(callback){
		
		Twitter.cb.__call(
			    "oauth_requestToken",
			    {oauth_callback: "oob"},
			    function (reply) {
			        // stores it
			        Twitter.cb.setToken(reply.oauth_token, reply.oauth_token_secret);

			        // gets the authorize screen URL
			        Twitter.cb.__call(
			            "oauth_authorize",
			            {},
		            	callback
			        );
			    }
			);
		
	},
	
	accessToken : function(pin, callback){
		
		Twitter.cb.__call(
			    "oauth_accessToken",
			    {oauth_verifier: pin},
			    function (reply) {
			        // store the authenticated token, which may be different from the request token (!)
			        Twitter.cb.setToken(reply.oauth_token, reply.oauth_token_secret);

			        // if you need to persist the login after page reload,
			        // consider storing the token in a cookie or HTML5 local storage
			        
			        callback(reply.oauth_token, reply.oauth_token_secret);
			    }
			);
		
	},

	call : function(endpoint, params, callback) {

		if (Settings.ONLINE){
			
			Twitter.cb.__call(endpoint, params, callback);
						
		} else {

			result = null;
			
			if (endpoint == 'account_verifyCredentials'){
				result = TweetStore.accountVerifyCredentials;
			}

			if (endpoint == 'search_tweets'){
				result = TweetStore.searchTweets;
			}

			if (endpoint == 'statuses_oembed'){
				result = TweetStore.statusesOembed;
			}
			
			callback(result);
			return;
			
		}
		
	},
	
	search : function(term, callback) {
		
		var params = {
			q : term + " -filter:retweets"
		}
		
		Twitter.call("search_tweets", params, function(result) {

			var ids = [];
			
			async.eachSeries(result.statuses, function(status, done){
				
				ids.push(status.id_str);
				
				done();
				
			}, function(err){
				
				console.log("search results: " + ids);
				callback(ids);
				
			});
			
		});
		
	},

	oembedTweets : function(tweetIds, callback) {
		
		var contentAll = '';
		
		async.eachSeries(tweetIds, function(tweetId, done){
			
			Twitter.oembedTweet(tweetId, function(content){
				
				if (contentAll){
					contentAll = contentAll + Twitter.NEWLINE; 
				}
				
				contentAll = contentAll + content;
				
				// need to call done() to tell eachSeries we're... done.
				done();
				
			});
			
		}, function(err){
			
			callback(contentAll);
			
		});
		
	},
	
	oembedTweet : function(tweetId, callback) {

		var hide_media = Settings.properties.embedShowMedia ? "false" : "true";
		var hide_thread = Settings.properties.embedShowConversation ? "false" : "true";
		
		var params = {
			hide_media : hide_media,
			hide_thread : hide_thread,
			id : tweetId,
			omit_script : "true"
		}

		Twitter.call("statuses_oembed", params, function(result) {

			var content = result.html;
			if (callback){
				callback(content);
			}
			
		});

	},
	
}

var URL = {

	CHROME_BASE : "chrome-extension://"+chrome.runtime.id+"/",

	TWITTER_AUTH_LOGIN : "http://twitter.com/login",

	TWITTER_AUTH_LOGOUT : "http://twitter.com/logout",

	TWITTER_STATUS : 'https://twitter.com/intent/tweet?text=',
	
	YOUTUBE_WATCH : "www.youtube.com/watch?",

	make : function(page, params) {
		if (!params){
			params = {}
		}
		params['page'] = page;
		var url = URL.CHROME_BASE + "page.html?" + QueryString.encode(params);
		return url;
	},
	
	open : function(page, params) {
		var url = URL.make(page, params);
		chrome.tabs.create({
			"url" : url
		});
	},
	
	external : function(url){
		chrome.tabs.create({
			"url" : url
		});
	}

}

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

Settings.DEFAULT = {
	 'apiKey' : Settings.API_KEY, 
	 'apiSecret' : Settings.API_SECRET,
	 'accessToken' : Settings.ACCESS_TOKEN, 
	 'accessTokenSecret' : Settings.ACCESS_TOKEN_SECRET,
	 'authState' : Settings.AUTH_STATE_LOGIN, 
	 'embedTheme' : 'light',
	 'embedShowMedia' : false,
	 'embedShowConversation' : false,
	 'embedIncludeScriptTag' : false
}