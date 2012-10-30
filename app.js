/*jslint browser:true,devel:true,white:true,nomen:true,bad_new:true*/
/*globals jQuery,Ember*/ 

var App;

(function($, Ember) {
	'use strict';
	
	/** create App **/ 
	App = Ember.Application.create();
	
	/** Application **/
	App.ApplicationView = Ember.View.extend({
		templateName: 'application'
	});
	App.ApplicationController = Ember.Controller.extend();
	
	/** Tweets **/
	App.TweetsView = Ember.View.extend({
		templateName: 'tweets'
	});
	App.TweetsController = Ember.ArrayController.extend();
	
	/** currentUsername Object **/
	App.currentUsername = Ember.Object.create({
		username: ''
	});
	
	/** Users **/
	App.UsersView = Ember.View.extend({
		templateName: 'users'
	});
	App.UsersController = Ember.ArrayController.extend({
		content: []
	});
	
	/** User Object **/
	App.User = Ember.Object.extend();
	
	/** UserInput TextField **/
	App.UserInputView = Ember.TextField.extend({
		placeholder: "Twitter username",
		valueBinding: "App.currentUsername.username",
		insertNewline: function() {
        App.router.transitionTo('user', {username: App.currentUsername.username});
    }
	});
	
	/** Tweet object **/
	App.Tweet = Ember.Object.extend();
	App.Tweet.reopenClass({
		tweets: [],
		findAll: function(username) {
			this.tweets.clear();
			$.ajax({
				url: 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name=%@&callback=?'.fmt(username),
				dataType: 'jsonp',
				context: this,
				success: function(response){
					response.forEach(function(twt) {
						this.tweets.addObject(
							App.Tweet.create({
								avatar: twt.user.profile_image_url,
								screen_name: twt.user.screen_name,
								text: twt.text,
								date: twt.created_at
							})
						);
					}, this);
				}
			});
			return this.tweets;
		}
	});
	
	/** Router **/
	App.Router = Ember.Router.extend({
		enableLogging: true,
		root: Ember.Route.extend({
			loadTweets: function(router, event) {
				router.transitionTo('user', {username: event.context.username});
			},
			removeUser: function(router, event) {
				router.get('usersController').removeObject(event.context);
			},
			main: Ember.Route.extend({
				route: '/'
			}),
			user: Ember.Route.extend({
				route: '/:username',
				connectOutlets: function(router, context) {
					var usersController = router.get('usersController'),
						found;
						
					App.currentUsername.set('username', context.username);
					
					found = usersController.findProperty('username', context.username);
					if (found) {
						usersController.removeObject(found);
					}
					
					usersController.unshiftObject(
						App.User.create({
							username: context.username
						})
					);
					
					router.get('applicationController').connectOutlet('tweetsContent', 'tweets', App.Tweet.findAll(context.username));
					router.get('applicationController').connectOutlet('usersContent', 'users');
				}
			})
		})
	});
	
	/** initialize App **/
	App.initialize();
	
}(jQuery, Ember));