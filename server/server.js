var express = require("express")
  , app = express()
  , ejs = require("ejs")
  , history = require("./chat-history");

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

var io = require("socket.io").listen(expressInstance);

io.sockets.on("connection", function(socket) {
  socket.on("setName", function(data) {
    console.log("setName", data);
    socket.set("name", data)
  });

  socket.on("getHistory", function() {
    socket.get("name", function(err, name) {
      console.log("History requested by", name);
      socket.emit("history", history.getLast(100));
    })
  });

  socket.on("message", function(message) {
    socket.get("name", function(err, name) {
      var update = { "message": message, "userId": name };
      history.append(update);
      // Send to everyone
      socket.broadcast.emit("message", update);
      // Send to yourself
      socket.emit("message", update);
      console.log("user " + name + " send this: " + message);
    })
  })
})
