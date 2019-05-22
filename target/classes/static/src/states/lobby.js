Spacewar.lobbyState = function(game) {

}

//Funcion para entrarEnMatchMaking
function enterMatchMaking(){

    game.state.start('matchmakingState');
}

//Funcion que te entra en una sala
function CreateRoom(){

	game.state.start('createRoom');
}


Spacewar.lobbyState.prototype = {

    init : function() {
        if (game.global.DEBUG_MODE) {
            console.log("[DEBUG] Entering LOBBY state");
        }

        //game.world.setBounds(0, 0, 1920, 1920);
    },

    preload : function() {
    	

    },

    create : function() {
    	
    	//fijamos background
    	bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
    	
    	//Añadimos la imagen del looby
        lobby = game.add.sprite(game.world.centerX, game.world.centerY, 'lobby');
        lobby.scale.setTo(0.8,0.8);
        lobby.anchor.setTo(0.5,0.5);
        
        //Añadimos boton de añadir sala
        lobby.addChild(addRoom = game.add.button(0+150,0-60, 'addroom', CreateRoom, this, 2, 1, 0));
        addRoom.scale.setTo(0.6, 0.6);
        
        //Añadimos el boton de cerrar (sin funcion aun)
        lobby.addChild( close = game.add.button(0+150,0+240, 'exit', null , this, 2, 1, 0));
        close.scale.setTo(0.6, 0.6);
        
        //Añadimos el boton de Matchmaking
        lobby.addChild(start = game.add.button(0+150,0-160, 'start', enterMatchMaking , this, 2, 1, 0));
        start.scale.setTo(0.6, 0.6);
        
        //Añadimos 4 botones de Room
        lobby.addChild(room = game.add.sprite(-160,-130, 'roombg'));
        room.anchor.setTo(0.5, 0.5);
        lobby.addChild(room = game.add.sprite(-160,-30, 'roombg'));
        room.anchor.setTo(0.5, 0.5);
        lobby.addChild(room = game.add.sprite(-160,70, 'roombg'));
        room.anchor.setTo(0.5, 0.5);
        lobby.addChild(room = game.add.sprite(-160,170, 'roombg'));
        room.anchor.setTo(0.5, 0.5);
        
        //Añadimos el boton de Matchmaking
        lobby.addChild(forward = game.add.button(0,220, 'forward', null, this, 2, 1, 0));
        forward.scale.setTo(0.3, 0.3);
        lobby.addChild(backwards = game.add.button(-380,220, 'backwards', null , this, 2, 1, 0));
        backwards.scale.setTo(0.3, 0.3);
        
        //Añadimos las palabras lobby
        var style = { font: "45px Arial", fill: "#ffffff", align: "center" };
        lobby.addChild(lText = game.add.text(0, -310, "LOBBY", style));
        lText.anchor.setTo(0.5,0.5);

    },

    update : function() {


    },




}