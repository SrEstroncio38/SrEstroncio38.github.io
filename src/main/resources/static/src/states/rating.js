Spacewar.ratingState = function(game) {
	this.rankinglist;
	this.rankinglist2;
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
		
		game.global.myPlayer.rankingtext = "Cargando...";
		game.global.myPlayer.rankingnumber = "";

        $.getJSON("./playerScores.json", function (data) {
        	game.global.myPlayer.rankingtext = "";
        	game.global.myPlayer.rankingnumber = "";
        	for (var i = 0; i < 10; i++){
        		highername = "";
        		higherpoints = -1;
	            for (var name of Object.keys(data)){
	            	if (data[name] > higherpoints) {
	            		highername = name;
	            		higherpoints = data[name];
	            	}
	            }
	            game.global.myPlayer.rankingtext += (i+1) + ". " + highername + "\n";
	            if (higherpoints > -1) {
	            	game.global.myPlayer.rankingnumber += higherpoints + "\n";
	            }
	            delete data[highername];
        	}
        });
		

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
        
        //Añadimos el TOP 10
        var style = { font: "24px Arial", fill: "#ffffff", align: "left", boundsAlignH: 'left' };
        this.rankinglist = game.add.text(350, 170, "", style);
        style = { font: "24px Arial", fill: "#ffffff", align: "right", boundsAlignH: 'left' };
        this.rankinglist2 = game.add.text(850, 170, "", style);
	},

	update : function() {

		this.rankinglist.setText(game.global.myPlayer.rankingtext);
		this.rankinglist2.setText(game.global.myPlayer.rankingnumber);
		
	},		
	
}