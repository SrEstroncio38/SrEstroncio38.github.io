Spacewar.menuState = function(game) {
	this.currentinput
	this.currentinputtext
	this.deletingText
}

function goToLobby(){
	
	game.state.start('lobbyState');
}

Spacewar.menuState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MENU** state");
		}
	},

	preload : function() {
		
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.backKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
		
		// In case JOIN message from server failed, we force it
		if (typeof game.global.myPlayer.id == 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Forcing joining server...");
			}
			let message = {
				event : 'JOIN'
			}
			game.global.socket.send(JSON.stringify(message))
		}
	},

	create : function() {
		
		var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
    	
    	// play button
    	var start = game.add.button(game.world.centerX + 300,game.world.centerY - 50, 'start', goToLobby , this, 2, 1, 0);
    	start.anchor.setTo(0.5,0.5);
    	start.scale.setTo(0.6, 0.6);
    	
    	// chat window
    	var chatwindow = game.add.sprite(0, game.world.centerY, 'global_chat');
    	chatwindow.anchor.setTo(0,0.5);
    	chatwindow.scale.setTo(0.8,0.8);
    	
    	// chat input image
    	var textbox = game.add.sprite(10, game.world.centerY + 180, 'textinput');
        textbox.scale.setTo(2,0.5);
        textbox.anchor.setTo(0,0.5)
        
        // chat input text
		var style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		currentinputtext = "";
		currentinput = game.add.text(50, game.world.centerY + 180, currentinputtext, style);
		currentinput.anchor.set(0,0.5);
		
		deletingText = false;
	},

	update : function() {
		if (this.backKey.isDown){
			if (!deletingText) {
				currentinputtext = currentinputtext.substring(0,currentinputtext.length-1);
				deletingText = true;
			}
		} else {
			game.input.keyboard.addCallbacks(this, null, null, function (char) {
				if (currentinputtext.length < 32)
					currentinputtext += char;
			});
			deletingText = false;
		}
		currentinput.text = currentinputtext;

		if (this.enterKey.isDown){
			// TODO send message
			/*
			let message = {
				event : 'UPDATE NAME',
				username: game.global.myPlayer.username
			}
			game.global.socket.send(JSON.stringify(message))
			*/
			currentinputtext = "";
		}
	},		
	
}