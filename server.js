var express = require("express")
  , app = express()
  , jade = require("jade")
  , history = require("./chat-history")

app.set("views", __dirname + "/views");
app.set("view engine", "jade")
app.set("view options", { layout: false })
app.configure(function() {
  app.use(express.static(__dirname + "/public"))
})

app.get("/", function(req, res) {
  res.render("home.jade")
})

var expressInstance = app.listen(3000)

var io = require("socket.io").listen(expressInstance)

io.sockets.on("connection", function(socket) {
  socket.on("setName", function(data) {
    console.log("setName", data)
    socket.set("name", data)
  })

  socket.on("getHistory", function() {
    socket.get("name", function(err, name) {
      console.log("History requested by", name)  
      socket.emit("history", history.getLast(100));
    })
  })

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
