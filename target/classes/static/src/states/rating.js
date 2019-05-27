Spacewar.ratingState = function(game) {

}

function goToLobby(){
	
	game.state.start('lobbyState');
}

function MayorToMenor(a,b){
   return b-a;
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

        //Añadimos las palabras rating
        rating.addChild(ratinglogo = game.add.sprite(0, -310, 'ratinglogo'));
        ratinglogo.anchor.setTo(0.5,0.5);
        ratinglogo.scale.setTo(0.8,0.8)

        //Añadimos el ranking
        var text =""
        var points = new Array();
        var names = new Array();
        var i = 0;
        for (var name of Object.keys(game.global.scoresJson)){
            points[i] = game.global.scoresJson[name]
            names[i] = name;
            i++;
        }
        points.sort(MayorToMenor)
        for (var i = 0; i < points.length; i++){
            text += "Nombre: " + names[points[i]] + " Puntuacion: " + points[i] +"\n"
        }
        console.log(text)
	},

	update : function() {

	},		
	
}