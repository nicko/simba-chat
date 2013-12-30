var MessageDispatcher = function(socketRegistry) {
  this.socketRegistry = socketRegistry;
};

MessageDispatcher.prototype.dispatch = function(users, message) {
  var _this = this;
  users.forEach(function(user) {
    var socket = _this.socketRegistry[user];
    if (!socket) {
      console.log("dispatch: No socket found for user", user);
      return;
    }
    socket.emit("message", message);
  });
};

MessageDispatcher.prototype.dispatchAll = function(users, messages) {
  var _this = this;
  users.forEach(function(user) {
    var socket = _this.socketRegistry[user];
    if (!socket) {
      console.log("dispatchAll: No socket found for user", user);
      return;
    }
    socket.emit("messages", messages);
  });
};


// Server needs to keep track of discussionRegistry.
var Discussion = function(id, messageDispatcher) {
  this.id = id;
  this.messageDispatcher = messageDispatcher;
  this.members = [];
  this.messageHistory = [];
};

Discussion.prototype.addMessage = function(message) {
  console.log("Adding message", message);
  this.messageHistory.push(message);
  this.messageDispatcher.dispatch(this.members, message);
};

Discussion.prototype.addMember = function(userId) {
  console.log("Adding member", userId);
  if (this.members.indexOf(userId) == -1) {
    this.members.push(userId);
  } else {
    console.log(userId + " is already a member of " + this.id);
  }
  this.messageDispatcher.dispatchAll([userId], this.messageHistory);
};

var Message = function() {
  this.discussionId = null;
  this.userId = null;
  this.text = null;
  this.time = 0;
};

module.exports = {
  MessageDispatcher: MessageDispatcher,
  Discussion: Discussion,
  Message: Message
};