Spacewar.ratingState = function(game) {

}

function goToLobby(){
	
	game.state.start('lobbyState');
}

Spacewar.ratingState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **RATING** state");
		}
	},

	preload : function() {
		

	},

	create : function() {
		//fijamos background
    	bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
    	
    	//Añadimos la imagen del looby
        rating = game.add.sprite(game.world.centerX, game.world.centerY, 'lobby');
        rating.scale.setTo(0.8,0.8);
        rating.anchor.setTo(0.5,0.5);
        
        //Añadimos el boton de cerrar (sin funcion aun)
        rating.addChild( close = game.add.button(0+150,0+240, 'exit', goToMenu , this, 2, 1, 0));
        close.scale.setTo(0.6, 0.6);

        //Añadimos la tabla de puntuaciones
        rating.addChild(table = game.add.sprite(-380,-230,'ratingtable'));
        table.scale.setTo(0.4, 0.4);
        
        //Añadimos el boton de avanzar y retroceder
        rating.addChild(forward = game.add.button(-80,240, 'forward', null, this, 2, 1, 0));
        forward.scale.setTo(0.3, 0.3);
        rating.addChild(backwards = game.add.button(-360,240, 'backwards', null , this, 2, 1, 0));
        backwards.scale.setTo(0.3, 0.3);
        
        //Añadimos las palabras rating
        rating.addChild(ratinglogo = game.add.sprite(0, -310, 'ratinglogo'));
        ratinglogo.anchor.setTo(0.5,0.5);
        ratinglogo.scale.setTo(0.8,0.8)
	},

	update : function() {

	},		
	
}