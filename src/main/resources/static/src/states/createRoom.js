Spacewar.createRoom = function(game) {
	this.roomname
	this.deletingText
}

Spacewar.createRoom.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **createRoom** state");
		}
	},

	preload : function() {		
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.backKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
		
	},

	create : function() {
		
		
		var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
		
		var window = game.add.sprite(game.world.centerX, game.world.centerY, 'window');
        window.scale.setTo(0.5,0.5);
        window.anchor.setTo(0.5,0.5);
        
        var textbox = game.add.sprite(game.world.centerX, game.world.centerY + 20, 'textinput');
        textbox.scale.setTo(1,0.5);
        textbox.anchor.setTo(0.5,0.5);
		
		// add room name
		var style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		var text = game.add.text(game.world.centerX, game.world.centerY - 50, "Escribe nombre de sala:", style);
		text.anchor.set(0.5,0.5);
		game.global.myPlayer.roomname = "";
		roomname = game.add.text(game.world.centerX, game.world.centerY + 20, game.global.myPlayer.roomname, style);
		roomname.anchor.set(0.5,0.5);
		
		deletingText = false;
	},

	update : function() {
		if (this.backKey.isDown){
			if (!deletingText) {
				game.global.myPlayer.roomname = game.global.myPlayer.roomname.substring(0,game.global.myPlayer.roomname.length-1);
				deletingText = true;
			}
		} else {
			game.input.keyboard.addCallbacks(this, null, null, function (char) {
				if (game.global.myPlayer.roomname.length < 16)
					game.global.myPlayer.roomname += char;
			});
			deletingText = false;
		}
		roomname.text = game.global.myPlayer.roomname;

		if (this.enterKey.isDown){
			let message = {
					event : 'CREATE ROOM',
					roomname: game.global.myPlayer.roomname
				}
				game.global.socket.send(JSON.stringify(message))
		
				
		/*game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)
		switch (msg.event) {
		case 'GO TO ROOM':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] GO TO ROOM message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.roomname = msg.roomname
			game.state.start('roomState')
			break;
		default:
			break;
		}
		}*/
				game.state.start('roomState');
		}
	}
}