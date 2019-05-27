Spacewar.matchmakingState = function(game) {

}

Spacewar.matchmakingState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MATCH-MAKING** state");
		}
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] ");
		}
		let message = {
            //ESTE ES EL JOIN ROOM ANTIGUO, LE FALTAN ARGUMENTOS
			event : 'JOIN MATCHMAKING ROOM'
		}
		game.global.socket.send(JSON.stringify(message))
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
        /*var exit2 = game.add.button(game.world.centerX, game.world.centerY + 40, 'exit', exitWaitingRoom, this, 2, 1, 0);
        exit2.scale.setTo(0.5, 0.5);
        exit2.anchor.setTo(0.5,0.5);*/
        
        // add room name
		var style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		var text = game.add.text(game.world.centerX, game.world.centerY - 50, "Buscando sala", style);
		text.anchor.set(0.5,0.5);

	},

	update : function() {
		
	}
}