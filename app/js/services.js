'use strict';

/* Services */

var services = angular.module('SimbaChat.services', []);

// Model
// Discussion.title (unique)
// Discussion.created
// Discussion.messages
// Discussion.users (instance of User)
// Discussion.lastReadTime (used to calculate number of unread)
// User.name
// User.sessionId
// Session.user
// Session.isAuthenticated
// Session.discussionRegistry
// Message.text
// Message.user (who created it)
// Message.discussion (destination)

// To start up:
// Init session on startup
// Wait for user to authenticate with username / password
// Request room list
// Join global room

// To join a room:
// Request to join
// Subscribe to new messages
// Request history prior to current time, return up to 100 of them (using Rx)
// Display history

// To create a room:
// Call create discussion on ControlService with new id
// Join room with id

// Subscribing new messages
// Call subscribe() on ChatService passing in room id
// Chat service sends subscribe message to server with ID
// Server responds with last 100 messages, continues to send more (negates the need for a 'history' call)
// Chat service returns an Rx object which we then attach on(), error() and complete() handlers to
// Subscription object contains room ID which is curried onto send messages, sessionId is curried further up the stack

// Sending a message
// call send(message), room id and user id are added further up the stack

services.service("Endpoint", ["$rootScope", function($rootScope) {
  var socket = io.connect();

  this.send = function(command) {
    socket.emit.apply(socket, Array.prototype.slice.apply(arguments));
  };

  this.on = function(command, handler) {
    // Clever method for ensuring Angular updates after the call:
    // https://github.com/simpulton/angularjs-collab-board/blob/master/public/js/collab-board.js#L68
    socket.on(command, function() {
      var args = arguments;
      $rootScope.$apply(function() {
        handler.apply(socket, args);
      });
    });
  };
}]);

services.service("Session", ["$rootScope", "Endpoint", function($rootScope, endpoint) {
  var _this = this;

  this.isAuthenticated = false;
  this.userName = null;

  this.authenticate = function(userName, password) {
    console.log("Authenticating with details", userName, password);
    endpoint.send("init", userName);
    // Attempt to auth
    _this.isAuthenticated = true;
    _this.userName = userName;
    $rootScope.$broadcast("Session::isAuthenticatedChanged", _this.isAuthenticated);
  };
}]);

services.service("Chat", ["$rootScope", "Session", "Endpoint", function($rootScope, session, endpoint) {
  var _this = this;

  this.discussionRegistry = {};
  this.currentDiscussion = "global";

  endpoint.on("discussion", function(discussion) {

  });

  this.joinDiscussion = function(id) {
    var discussion = _this.discussions[id];
    if (!discussion) {
      discussion = new Discussion(id, session.userName, endpoint);
      endpoint.send("joinDiscussion", id, session.userName);
    }

    _this.currentDiscussion = id;
    return discussion;
  };
}]);


var Discussion = function(discussionId, userId, endpoint) {
  var _this = this;
  this.id = discussionId;
  this.userId = userId;
  this.endpoint = endpoint;
  this.handler = function noop(message) {};

  this.endpoint.on("message", handleMessage);

  this.endpoint.on("messages", function(messages) {
    messages.forEach(handleMessage);
  });

  this.on = function(handler) {
    _this.handler = handler;
  };

  this.send = function(text) {
    var message = {
      discussionId: _this.id,
      userId: _this.userId,
      text: text,
      time: new Date().getTime()
    };
    _this.endpoint.send("send", message);
  };

  function handleMessage(message) {
    if (_this.id === message.discussionId) {
      console.log("Discussion: message received", message);
      _this.handler(message);
    }
  }

};
