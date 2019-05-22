Spacewar.lobbyState = function(game) {

	// PRUEBA PRUEBERINA
}

function enterMatchMaking(){

    game.state.start('matchmakingState');
}

function goToRoom(){

	game.state.start('roomState');
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
        game.load.image('start','assets/buttons/Start_BTN.png');
        //game.load.image('+A','assets/buttons/Play_BTN_act.png');
        //game.load.image('-A','assets/buttons/Close_BTN_act.png');
        game.load.image('roombg','assets/images/buttongbg.png');
        

    },

    create : function() {
    	
    	bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
    	
        lobby = game.add.sprite(game.world.centerX, game.world.centerY, 'lobby');
        lobby.scale.setTo(0.8,0.8);
        lobby.anchor.setTo(0.5,0.5);
        
        addRoom = game.add.button(game.world.centerX + 240,game.world.centerY + 180, '+', goToRoom, this, 2, 1, 0);
        addRoom.scale.setTo(0.3, 0.3);
        
        close = game.add.button(game.world.centerX + 170,game.world.centerY + 180, '-', null , this, 2, 1, 0);
        close.scale.setTo(0.3, 0.3);
        
        lobby.addChild(start = game.add.button(0+150,0-160, 'start', enterMatchMaking , this, 2, 1, 0));
        start.scale.setTo(0.6, 0.6);
        
        lobby.addChild(room = game.add.sprite(-250,-130, 'roombg'));
        room.anchor.setTo(0.5, 0.5);
      
        var style = { font: "45px Arial", fill: "#ffffff", align: "center" };
        lobby.addChild(ltext = game.add.text(-60, -330, "Lobby", style));
        lText.anchor.setTo(0.5,0.5);

    },

    update : function() {


    },




}