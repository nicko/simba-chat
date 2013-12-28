'use strict';

/* Services */

var services = angular.module('SimbaChat.services', []);

// We need a session service which just connects and can then be authenticated
// then need a control service which allows for sending control messages like create room
// a chat service which uses session service (i.e. cannot be used without being authenticated)
// and provides history and subscribe-to-discussion

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
// Request history
// Display history
// Subscribe to new messages

// To create a room:
// Call create on ControlService with new id
// Join room with id

// Subscribing to a room
// Call subscribe() on ChatService passing in room id
// Returns an Rx object which we then attach on(), error() and complete() handlers to


services.factory("Chat", [function() {

  // Chat does only chat things

  return {
    connect: function() {}
  }
}]);

// Implementations

var Client = function() {
  this.socket = null;
  this.messageHandler = null;
  this.name = null;
};

Client.prototype.connect = function() {
  this.socket = io.connect();
  this.socket.on("message", handleMessage);
  this.socket.on("history", handleHistory);

  var _this = this;

  function handleMessage(data) {
    console.log("Handling message", data.message, data.userId);
    _this.messageHandler(data.message, data.userId);
  }

  function handleHistory(history) {
    console.log("Handling history", history.length)
    history.forEach(handleMessage);
  }
};

Client.prototype.setName = function(value) {
  this.name = value;
  if (this.socket) {
    this.socket.emit("setName", value);
    this.socket.emit("getHistory");
  }
};

Client.prototype.sendMessage = function(text) {
  if (this.socket)
    this.socket.emit("message", text);
};

Client.prototype.setMessageHandler = function(value) {
  this.messageHandler = value;
};

Client.prototype.isSelf = function(name) {
  return this.name == name;
};

var Utils = {
  format: function(template, data) {
    return template.replace(/{([^\}]+)}/g, function(unused, match) {
      return data[match];
    })
  }
};


