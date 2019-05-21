Spacewar.nameState = function(game) {
	this.username
	this.deletingText
}

Spacewar.nameState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MENU** state");
		}
	},

	preload : function() {
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.backKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
		
		// add your name
		var style = { font: "24px Arial", fill: "#ffffaa", align: "center" };
		var text = game.add.text(game.world.centerX, game.world.centerY, "Escribe tu nombre:", style);
		text.anchor.set(0.5,0.75);
		game.global.myPlayer.username = "";
		style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		username = game.add.text(game.world.centerX, game.world.centerY, "< " + game.global.myPlayer.username + " >", style);
		username.anchor.set(0.5,-0.75);
		
		deletingText = false;
		
		
	},

	create : function() {

	},

	update : function() {
		if (this.backKey.isDown){
			if (!deletingText) {
				game.global.myPlayer.username = game.global.myPlayer.username.substring(0,game.global.myPlayer.username.length-1);
				deletingText = true;
			}
		} else {
			game.input.keyboard.addCallbacks(this, null, null, function (char) {
				game.global.myPlayer.username += char;
			});
			deletingText = false;
		}
		username.text = "< " + game.global.myPlayer.username + " >";

		if (this.enterKey.isDown && typeof game.global.myPlayer.id !== 'undefined'){
			let message = {
					event : 'UPDATE NAME',
					username: game.global.myPlayer.username
				}
				game.global.socket.send(JSON.stringify(message))
		
			game.state.start('menuState');
		}
	}
}