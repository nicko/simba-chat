var Client = function() {
	this.socket = null;
	this.messageHandler = null;
	this.name = null;
}

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
}

Client.prototype.setName = function(value) {
	this.name = value;
	if (this.socket) {
		this.socket.emit("setName", value);
		this.socket.emit("getHistory");
	}
}

Client.prototype.sendMessage = function(text) {
	if (this.socket)
		this.socket.emit("message", text);
}

Client.prototype.setMessageHandler = function(value) {
	this.messageHandler = value;
}