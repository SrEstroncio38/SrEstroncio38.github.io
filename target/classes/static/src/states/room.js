Spacewar.roomState = function(game) {

}

Spacewar.roomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **ROOM** state");
		}
	},

	preload : function() {
		var roomname = "Sala 2"
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room: '" + roomname + "'");
		}
		let message = {
			event : 'JOIN ROOM',
			room: roomname
		}
		game.global.socket.send(JSON.stringify(message))
	},

	create : function() {

	},

	update : function() {
		game.state.start('gameState')
	}
}