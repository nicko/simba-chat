// Types

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

Client.prototype.isSelf = function(name) {
	return this.name == name;
}

var Utils = {
	format: function(template, data) {
		return template.replace(/{([^\}]+)}/g, function(unused, match) {
			return data[match];
		})
	}
};


// App

$(function() {
	var messageTemplate = "<div class=\"{className}\"><p>{user}: {message}</p></div>";
	var client = new Client();
	client.setMessageHandler(messageHandler);
	client.connect();

	$("#chat-footer").hide();
	$("#form-name").on("submit", setName);
	$("#form-chat").on("submit", sendMessage);
	$("#input-message").change(updateMessageStatus);

	function setName(e) {
		var val = $("#input-name").val();
		if (val == "") return false;
		client.setName(val);
		$("#chat-footer").show();
		$("#form-name").hide();
		return false;
	}

	function sendMessage(e) {
		var val = $("#input-message").val();
		if (val == "") return false;
		console.log("sending", val)
		client.sendMessage(val);
		$("#input-message").val("");
		return false;
	}

	function messageHandler(message, userId) {
		console.log("received", message, userId)
		var data = {
			message: message
		};
		if (client.isSelf(userId)) {
			data.className = "message-self";
			data.user = "You";
		} else {
			data.className = "message";
			data.user = userId;
		}
		$("#chat-history").append(Utils.format(messageTemplate, data));
	}

	function updateMessageStatus() {
		var val = $("#input-message").val();
		if (val == "") {
			console.log("button should be disabled")
		} else {
		  console.log("button should be enabled")
		}
	}
});