var ChatHistory = function() {
	console.log("History module loaded");
}

ChatHistory.prototype.entries = []

ChatHistory.prototype.getLast = function(numEntries) {
	return this.entries.slice(0, numEntries);
}

ChatHistory.prototype.append = function(data) {
	this.entries.push(data)
}

module.exports = new ChatHistory();