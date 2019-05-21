Spacewar.lobbyState = function(game) {

	// PRUEBA PRUEBERINA
}

function actionOnClick(){

    lobby.visible.setTo = false;
    console.log("hola");
    console.log("esto Es una prueba");
    game.state.start('matchmakingState');
}

Spacewar.lobbyState.prototype = {

    init : function() {
        if (game.global.DEBUG_MODE) {
            console.log("[DEBUG] Entering LOBBY state");
        }

        //game.world.setBounds(0, 0, 1920, 1920);
    },

    preload : function() {
        game.load.image('lobby','assets/images/lobby.png');
        game.load.image('+','assets/buttons/Play_BTN.png');
        game.load.image('-','assets/buttons/Close_BTN.png');
        game.load.image('+A','assets/buttons/Play_BTN_act.png');
        game.load.image('-A','assets/buttons/Close_BTN_act.png');

    },

    create : function() {
    	
        lobby = game.add.sprite(game.world.centerX, game.world.centerY, 'lobby');
        lobby.scale.setTo(0.8,0.8);
        lobby.anchor.setTo(0.5,0.5);
        addRoom = game.add.button(game.world.centerX + 240,game.world.centerY + 180, '+', actionOnClick, this, '+A', '+','+A', '+');
        addRoom.scale.setTo(0.3, 0.3);
        close = game.add.button(game.world.centerX + 170,game.world.centerY + 180, '-', actionOnClick, this, 2, 1, 0);
        close.scale.setTo(0.3, 0.3);
    },

    update : function() {
    	
    },




}