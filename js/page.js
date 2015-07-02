/*
 * page.js handles only interaction with user.
 * any model/controller logic is deferred to background.js.
 */

// BUGBUG:
// - Copy to clipboard functionality!

$(document).ready(function() {

	Settings.init(function(){
		console.log("Settings.init complete");
		Page.init();
	}, function() {
		URL.open("settings");
	});

});

$(document).error(function(){
	Page.setError("Some error.");
});

var Page = {

	init : function() {

		$('#status').hide();
		$('#error').hide();

		SettingsPage.init();
		Page.setDefault();

	},

	setDefault : function() {

		var isAuthenticated = Settings.properties['accessToken'];
		var authState = Settings.properties['authState'];
		if (isAuthenticated){
			SettingsPage.setState(isAuthenticated, false);
		} else if (authState && authState == Settings.AUTH_STATE_PIN){
			SettingsPage.setState(false, true);
		} else {
			SettingsPage.setState(isAuthenticated, false);
		}

		var page = QueryString.get("page", "collections");
		if ((Settings.ONLINE && !isAuthenticated) || page == 'settings') {
			SettingsPage.showTab();
		} else if (page == 'tutorial'){
			TutorialPage.showTab();
		} else if (page == 'save'){
			CollectionsPage.showTab();
			CollectionsPage.showSaveTweet();
		} else /* if (page == 'collections') */ {
			CollectionsPage.showTab();
			CollectionsPage.showCollections();
		}
	},

	setStatus : function(text) {

		$('#status').html(text).show();
		setTimeout(function() {
			$('#status').fadeOut();
		}, Settings.UI_TIMEOUT);
	},

	setError : function(text) {

		$('#error').html(text).show();
		setTimeout(function() {
			$('#error').fadeOut();
		}, Settings.UI_TIMEOUT);
	},

	setSpinner : function(id){
		$(id).html("<div class='spinner'><img src='img/spinner.gif'></div>");
	},

}
var SettingsPage = {

	init : function() {
		
		$("#advanced_options").hide();

		SettingsPage.load(function() {

			$('#embedType').change(function(e) {
				// alert($('#embedType').val());
				if ($('#embedType').val() == 'custom') {
					$("#embedTemplateSection").fadeIn();
				} else {
					$("#embedTemplateSection").hide();
				}
				return false;
			});

			$('#embedType').change();
		});

		$(document).on('click', '#settings_save', function(e) {
			SettingsPage.save();
			return false;
		});

		$(document).on('click', '#auth_connect', function(e) {
			
			var request = {
					type : "background.twitterRequestToken",
				};

			chrome.runtime.sendMessage(request, function(response) {
				var properties = {
						authState : Settings.AUTH_STATE_PIN
					};
				Settings.save(properties, function(){
					SettingsPage.setState(false, true);
					Page.setStatus("Please enter PIN below.");
				});
			});
			
			return false;
		});

		$(document).on('click', '#auth_pin', function(e) {
			
			var request = {
					type : "background.twitterAccessToken",
					pin : $('#authenticationPin').val()
				};

			chrome.runtime.sendMessage(request, function(response) {
				var success = response.success;
				var status = response.status; 
				if (success){

					var properties = {
							authState : Settings.AUTH_STATE_COMPETED
						};
					Settings.save(properties, function(){
						Page.setStatus(status);
						SettingsPage.setState(true, false);
						
						URL.open("tutorial");
					});

				} else {
					Page.setError(status);
					SettingsPage.setState(false, false);
				}
			});
			
			return false;
		});
		
		$(document).on('click', '#auth_restart', function(e) {
			
			var properties = {
					authState : Settings.AUTH_STATE_LOGIN
				};
			Settings.save(properties, function(){
				SettingsPage.setState(false, false);
			});
			
			return false;
		});
		
		$(document).on('click', '#auth_disconnect', function(e) {

			var properties = [
				'accessToken',
				'accessTokenSecret'
			]
			Settings.remove(properties, function() {
				var request = {
						type : "background.reloadSettings",
					};

				chrome.runtime.sendMessage(request, function(response) {
					Page.setStatus("Settings saved.");
					SettingsPage.setState(false, false);
				});
			});
			
		});
		
		$(document).on("click", "#advanced_options_toggle", function() {
			$("#advanced_options_toggle").hide();
			$("#advanced_options").fadeIn();
		});


	},

	showTab : function() {
		$('#myTab a[href="#settings"]').tab('show');
	},
	
	setState : function(isAuthenticated, isWaitingForPin) {
		$(".auth_input").hide();
		if (isAuthenticated){
			$("#auth_disconnect").show();
		} else if (isWaitingForPin){
			$(".auth_pin_holder").show();
		} else {
			$("#auth_connect").show();
		}
	},

	load : function(callback) {
		Object.keys(Settings.properties).forEach(function(key) {

			var value = Settings.properties[key];

			var id = "#" + key;
			var el = $(id);
			
			if (el.is(':checkbox')){
				$(id).prop('checked', value);
			} else {
				$(id).val(value);
			}
			

		});

		if (callback) {
			callback();
		}
	},

	save : function(callback) {

		var properties = {};

		for ( var i = 0; i < Settings.PROPERTIES.length; i++) {
			
			var key = Settings.PROPERTIES[i];
			var id = "#" + key;
			var el = $(id);
			
			var val = '';
			if (el.is(':checkbox')){
				val = el.prop('checked') == true;
			} else {
				val = el.val();
			}

			properties[key] = val;
		}

//		console.log('SettingsPage.save: ' + JSON.stringify(properties));

		Settings.save(properties, function() {
			var request = {
					type : "background.reloadSettings",
			};

			chrome.runtime.sendMessage(request, function(response) {
				Page.setStatus("Settings saved.");
			});
		});

		if (callback) {
			callback();
		}

	},

}
