Spacewar.roomState = function(game) {

}

function goToGame(){
	game.state.start('gameState')
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
    	GameRoom = game.add.sprite(game.world.centerX, game.world.centerY, 'lobby');
        GameRoom.scale.setTo(0.8,0.8);
        GameRoom.anchor.setTo(0.5,0.5);
        
        //Cargamos imagen de nave y su marco
        frameShip = game.add.sprite(20 , 50, 'frame', game.global.myPlayer.shipType);
        spaceShip = game.add.sprite(0, 0, 'spacewar',game.global.myPlayer.shipType);
        
        //Cargamos boton empezar
        ship = game.add.button(640,580, 'ship', goToGame, this, 2, 1, 0);
        ship.scale.setTo(0.6, 0.6);
        ship.anchor.setTo(0.5,0.5);
	},

	update : function() {
		//game.state.start('gameState')
	}
}