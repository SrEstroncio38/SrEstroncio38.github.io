Spacewar.waitingRoom = function(game) {
	
}


function exitWaitingRoom(){
	let message = {
	        //Mensaje que se trata en WebsocketGameHandler.java
			event : 'FORFEIT JOIN ROOM',
			room : game.global.myPlayer.roomname
		}
		game.global.myPlayer.gamemode = ""
		game.global.myPlayer.roomname = ""
		game.global.socket.send(JSON.stringify(message))
	game.state.start('lobbyState')
}


Spacewar.waitingRoom.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **repeatedRoom** state");
		}
	},

	preload : function() {		

		
	},

	create : function() {

		
		//Colocamos el background
		var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
		
    	//Colocamos la ventana
		var window = game.add.sprite(game.world.centerX, game.world.centerY, 'window');
        window.scale.setTo(0.5,0.5);
        window.anchor.setTo(0.5,0.5);
        
        
        //Cargamos boton de volver al menu
        var exit2 = game.add.button(game.world.centerX, game.world.centerY + 40, 'exit', exitWaitingRoom, this, 2, 1, 0);
        exit2.scale.setTo(0.5, 0.5);
        exit2.anchor.setTo(0.5,0.5);
        
        // add room name
		var style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		var text = game.add.text(game.world.centerX, game.world.centerY - 50, "Esperando a entrar a sala", style);
		text.anchor.set(0.5,0.5);
		
	},

	update : function() {
		
			
		}
	}
