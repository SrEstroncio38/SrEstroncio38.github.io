Spacewar.roomState = function(game) {

}

function goToGame(){
	game.state.start('gameState')
}

function exitGame(){
	game.global.myPlayer.gamemode = ""
	game.global.myPlayer.gameroom = ""
	//FALTA MANEJAR SALIR DE SALA CON ALGUN MENSAJE
	//SI ADEMAS ERES EL LIDER ECHAS AL RESTO LES GUSTE O NO
	//ESTO AUN NO SE PUEDE HACER PORQUE FALTAN COSAS QUE IMPLEMENTAR Y TENGO SUEÑO
	game.state.start('menuState')
}

Spacewar.roomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **ROOM** state");
		}
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room: '" + roomname + "'");
		}
		let message = {
			event : 'JOIN ROOM',
			room: game.global.myPlayer.roomname
		}
		game.global.socket.send(JSON.stringify(message))
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
        ship = game.add.button(135, 560, 'exit', exitGame, this, 2, 1, 0);
        ship.scale.setTo(0.5, 0.5);
        ship.anchor.setTo(0.5,0.5);
        
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
        roomplayers = game.add.text(323,275, game.global.myPlayer.gamemode ,style)
        
        
	},

	update : function() {
		//game.state.start('gameState')
	}
}