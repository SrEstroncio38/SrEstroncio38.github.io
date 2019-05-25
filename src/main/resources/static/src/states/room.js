Spacewar.roomState = function(game) {
	this.currentinput
	this.currentinputtext
	this.deletingText
	
	this.ship
	this.roomplayers
	this.roommode
}

function goToGame(){
	let message = {
		event : 'START GAME',
		room : game.global.myPlayer.roomname
	}
	game.global.socket.send(JSON.stringify(message))
}

function exitGame(){
	let message = {
		event : 'LEAVE ROOM',
		room : game.global.myPlayer.roomname
	}
	game.global.myPlayer.gamemode = ""
	game.global.myPlayer.roomname = ""
	game.global.socket.send(JSON.stringify(message))
	game.state.start('lobbyState')
}

Spacewar.roomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **ROOM** state");
		}
	},

	preload : function() {
		
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.backKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
		
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room: '" + roomname + "'");
		}
	},

	create : function() {
		
		//Cargamos el Background
		bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
    	
    	//Cargamos imagen GameRoom
    	GameRoom = game.add.sprite(5, 10, 'lobby');
        GameRoom.scale.setTo(0.8,0.8);
        //GameRoom.anchor.setTo(0.5,0.5);
        
        //Cargamos titulo de hangar
        hangar = game.add.sprite(385, 80, 'hangar')
        hangar.scale.setTo(0.5,0.5)
        hangar.anchor.setTo(0.5,0.5)
        
        //Cargamos imagen de nave y su marco
        frameShip = game.add.sprite(95, 70, 'frame');
        frameShip.anchor.setTo(0.8,0.8)
        frameShip.scale.setTo(1.1,1.1)
        spaceShip = game.add.sprite(73, 46, 'spacewar',game.global.myPlayer.shipType);
        frameShip.anchor.setTo(0.5,0.5)
        
        //Cargamos boton empezar
        ship = game.add.button(640, 560, 'ship', goToGame, this, 2, 1, 0);
        ship.scale.setTo(0.5, 0.5);
        ship.anchor.setTo(0.5,0.5);
        
        //Cargamos boton de volver al menu
        exit = game.add.button(135, 560, 'exit', exitGame, this, 2, 1, 0);
        exit.scale.setTo(0.5, 0.5);
        exit.anchor.setTo(0.5,0.5);
        
        //Cargamos fondo del chat
        chatroombg = game.add.sprite(800,15, 'chatroombg' )
        chatroombg.scale.setTo(1.25,1)
        
        //Cargamos barra de texto
        textbox = game.add.sprite(830, 570, 'textinput');
        textbox.scale.setTo(1.25,0.5);
        textbox.anchor.setTo(0,0.5)
        
        //Cargamos texto de nombre de sala
        var style = { font: "35px Arial", fill: "#ffffff", align: "center" };
        game.add.text(73, 155, "Sala:",style)
        roomname = game.add.text(173, 155, game.global.myPlayer.roomname , style)
        
        //Cargamos texto de jugadores
        game.add.text(73, 215, "Jugadores:", style)
        roomplayers = game.add.text(253,215, "x/x",style)
        
        //Cargamos texto de modo de juego
        game.add.text(73, 275, "Modo de juego:", style)
        roommode = game.add.text(323,275, game.global.myPlayer.gamemode ,style)
        
        // chat input text
		var style = { font: "24px Arial", fill: "#ffffff", align: "center", boundsAlignH: 'left' };
		currentinputtext = "";
		currentinput = game.add.text(856, 570, currentinputtext, style);
		currentinput.anchor.set(0,0.5);
		let mask = game.add.graphics(0, 0);
		mask.beginFill(0xffffff);
		mask.drawRect(856,0,350,640);
		currentinput.mask = mask;
		currentinput.setTextBounds(0,0,350,640);
		
		deletingText = false;
		
		// chat text
		style = { font: "20px Arial", fill: "#aaaaaa", align: "left", wordWrap: true, wordWrapWidth: 410 };
		game.global.myPlayer.chattext = "Unido al chat de " + game.global.myPlayer.roomname + ".";
		game.global.myPlayer.chat = game.add.text(840, game.world.centerY + 215, game.global.myPlayer.chattext, style);
		game.global.myPlayer.chat.anchor.set(0,1);
		mask = game.add.graphics(0, 0);
		mask.beginFill(0xffffff);
		mask.drawRect(0,40,1280,640);
		game.global.myPlayer.chat.mask = mask;
        
	},

	update : function() {
		
		if (game.global.myPlayer.isRoomOwner) {
			ship.x = 640;
			ship.y = 560;
		} else {
			ship.x = -500;
			ship.y = -500;
		}
		
		roomplayers.setText(game.global.myPlayer.roomcurrentplayers + "/" + game.global.myPlayer.roommaxplayers);
		roommode.setText(game.global.myPlayer.gamemode);

    	// Position currentinput correctly
		if (currentinput.width > 350){
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
				event : 'POST ROOM CHAT',
				username: game.global.myPlayer.username,
				text: currentinputtext
			}
			game.global.socket.send(JSON.stringify(message))
			currentinputtext = "";
		}
	}
}