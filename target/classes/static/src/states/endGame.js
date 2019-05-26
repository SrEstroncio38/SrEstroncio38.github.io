Spacewar.endGame = function(game) {

}

function goToLobby2(){
	
	let message = {
        //Mensaje que se trata en WebsocketGameHandler.java
		event : 'LEAVE ROOM',
		room : game.global.myPlayer.roomname
	}
	game.global.myPlayer.gamemode = ""
	game.global.myPlayer.roomname = ""
	game.global.socket.send(JSON.stringify(message))
	game.state.start('lobbyState')
}

function reEnterInARoom(){

    /**
     * Este mensaje no tengo claro si tiene que salir, depende si al acabar cortamos
     * directamente el hilo de ejecucion o no o si le hacemos o no abandonar la sala
     * cuando vayamos al ranking
     */
    /*let message = {
                //Mensaje que se trata en WebsocketGameHandler.java
				event : 'JOIN ROOM',
				room: game.global.myPlayer.roomname
			}
		game.global.socket.send(JSON.stringify(message))*/
}

Spacewar.endGame.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **END GAME** state");
		}
	},

	preload : function() {
		let message = {
            //Mensaje que se trata en el WebsocketGameHandler.java
            event : 'ASK FOR SCORES IN ROOM',
            player : game.global.myPlayer.id,
            room : game.global.myPlayer.roomname
		}
		game.global.socket.send(JSON.stringify(message))

	},

	create : function() {
		//fijamos background
    	bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
    	
    	//Añadimos la imagen del looby
        rating = game.add.sprite(game.world.centerX, game.world.centerY, 'lobby');
        rating.scale.setTo(0.8,0.8);
        rating.anchor.setTo(0.5,0.5);
        
        //Añadimos el boton de cerrar 
        rating.addChild( close = game.add.button(0-150,0+240, 'exit', goToLobby2 , this, 2, 1, 0));
        close.scale.setTo(0.6, 0.6);

        //Añadimos el boton de reentrar (aun no hace nada)
        rating.addChild( close = game.add.button(0+150,0+240, 'ship', reEnterInARoom , this, 2, 1, 0));
        close.scale.setTo(0.6, 0.6);
        
        //Añadimos las palabras rating
        rating.addChild(ratinglogo = game.add.sprite(0, -310, 'ratinglogo'));
        ratinglogo.anchor.setTo(0.5,0.5);
        ratinglogo.scale.setTo(0.8,0.8)

        //Añadimos las puntuaciones
        style7 = { font: "24px Arial", fill: "#ffffff", align: "left"};
    	game.global.myRoomPoints = game.add.text(game.world.centerX, game.world.centerY, "", style7);
    	mask2 = game.add.graphics(0, 0);
    	mask2.beginFill(0xffffff);
		mask2.drawRect(game.world.centerX,game.world.centerY,1280,395);
		game.global.myRoomPoints.mask = mask2;
	},

	update : function() {

	},		
	
}