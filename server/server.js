var express = require("express")
  , app = express()
  , ejs = require("ejs")
  , history = require("./chat-history")
  , types = require("./types");

// TODO: Work out a nicer way to manage the basic index page.
app.engine('html', require('ejs').renderFile);
app.set("view options", { layout: false });
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});
app.use("/css", express.static(__dirname + "/../app/css"));
app.use("/img", express.static(__dirname + "/../app/img"));
app.use("/js", express.static(__dirname + "/../app/js"));
app.use("/lib", express.static(__dirname + "/../app/lib"));
app.use("/partials", express.static(__dirname + "/../app/partials"));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.get("/", function(req, res) {
  res.render("../app/index.html");
});


var expressInstance = app.listen(3000);

var discussionById = {};
var socketByUserId = {};
var messageDispatcher = new types.MessageDispatcher(socketByUserId);
var defaultDiscussion = new types.Discussion("global", messageDispatcher);
defaultDiscussion.addMessage({ text: "I am an historical message", userId: "cats", discussionId: "global", time: new Date().getTime() })
discussionById["global"] = defaultDiscussion;

var io = require("socket.io").listen(expressInstance);
io.sockets.on("connection", function(socket) {

  socket.on("init", function(userId) {
    socketByUserId[userId] = socket;
    socket.set("name", userId);
  });

  socket.on("createDiscussion", function(id) {
    discussionById[id] = new types.Discussion(id, messageDispatcher);
  });

  socket.on("joinDiscussion", function(discussionId, userId) {
    discussionById[discussionId].addMember(userId);
  });

  socket.on("send", function(message) {
    var disc = discussionById[message.discussionId];
    if (!disc) return;
    disc.addMessage(message);
  });
});

