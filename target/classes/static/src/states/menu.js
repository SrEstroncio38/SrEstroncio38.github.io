Spacewar.menuState = function(game) {
	this.currentinput
	this.currentinputtext
	this.deletingText
}

function goToLobby(){
	
	game.state.start('lobbyState');
}

function goToRating(){
	
	game.state.start('ratingState');
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
    	var start = game.add.button(game.world.centerX + 300,game.world.centerY + 250, 'start', goToLobby , this, 2, 1, 0);
    	start.anchor.setTo(0.5,0.5);
    	start.scale.setTo(0.6, 0.6);
    	
    	// rating button
    	var start = game.add.button(game.world.centerX + 500,game.world.centerY + 250, 'rating', goToRating , this, 2, 1, 0);
    	start.anchor.setTo(0.5,0.5);
    	start.scale.setTo(0.4, 0.4);
    	
    	// chat window
    	var chatwindow = game.add.sprite(0, game.world.centerY, 'global_chat');
    	chatwindow.anchor.setTo(0,0.5);
    	chatwindow.scale.setTo(0.8,0.8);
    	
    	// chat input image
    	var textbox = game.add.sprite(10, game.world.centerY + 180, 'textinput');
        textbox.scale.setTo(2,0.5);
        textbox.anchor.setTo(0,0.5)
        
        // chat input text
		var style = { font: "24px Arial", fill: "#ffffff", align: "center", boundsAlignH: 'left' };
		currentinputtext = "";
		currentinput = game.add.text(44, game.world.centerY + 180, currentinputtext, style);
		currentinput.anchor.set(0,0.5);
		let mask = game.add.graphics(0, 0);
		mask.beginFill(0xffffff);
		mask.drawRect(44,0,566,640);
		currentinput.mask = mask;
		currentinput.setTextBounds(0,0,566,640);
		
		deletingText = false;
		
		// chat text
		style = { font: "24px Arial", fill: "#aaaaaa", align: "left", wordWrap: true, wordWrapWidth: 600 };
		game.global.chat.element = game.add.text(32, game.world.centerY + 140, game.global.chat.text, style);
		game.global.chat.element.anchor.set(0,1);
		mask = game.add.graphics(0, 0);
		mask.beginFill(0xffffff);
		mask.drawRect(0,110,1280,640);
		game.global.chat.element.mask = mask;
		
		// playing players window
    	var pcon = game.add.sprite(game.world.centerX+290, game.world.centerY-20, 'playersconexion');
    	pcon.scale.setTo(0.65,0.6)
    	pcon.anchor.setTo(0.5,0.5);
		
    	// playing players list
    	style = { font: "24px Arial", fill: "#ffffff", align: "left"};
    	game.global.playingPlayers = game.add.text(game.world.centerX+190, game.world.centerY-220, "", style);
    	mask = game.add.graphics(0, 0);
    	mask.beginFill(0xffffff);
		mask.drawRect(game.world.centerX+190,game.world.centerY-220,1280,395);
		game.global.playingPlayers.mask = mask;
    	let message = {
			event : 'ASK PLAYING PLAYERS'
		}
		game.global.socket.send(JSON.stringify(message))
	},

	update : function() {
		
		// Position currentinput correctly
		if (currentinput.width > 566){
			currentinput.boundsAlignH = 'right';
		} else {
			currentinput.boundsAlignH = 'left';
		}
		
		if (this.backKey.isDown){
			if (!deletingText) {
				currentinputtext = currentinputtext.substring(0,currentinputtext.length-1);
				deletingText = true;
			}
		} else {
			game.input.keyboard.addCallbacks(this, null, null, function (char) {
				if (currentinputtext.length < 256)
					currentinputtext += char;
			});
			deletingText = false;
		}
		currentinput.text = currentinputtext;

		if (this.enterKey.isDown && currentinputtext.length > 0){
			let message = {
				event : 'POST GLOBAL CHAT',
				username: game.global.myPlayer.username,
				text: currentinputtext
			}
			game.global.socket.send(JSON.stringify(message))
			currentinputtext = "";
		}
	},		
	
}