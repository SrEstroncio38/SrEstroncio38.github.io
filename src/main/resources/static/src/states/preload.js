Spacewar.preloadState = function(game) {

}

Spacewar.preloadState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PRELOAD** state");
		}
	},

	preload : function() {

		game.load.atlas('spacewar', 'assets/atlas/spacewar.png',
				'assets/atlas/spacewar.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		game.load.atlas('explosion', 'assets/atlas/explosion.png',
				'assets/atlas/explosion.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		
		//Imagenes del lobby
		game.load.image('global_chat','assets/images/global_chat.png');
		game.load.image('lobby','assets/images/lobby.png');
        game.load.image('addroom','assets/buttons/Map_BTN.png');
        game.load.image('exit','assets/buttons/Exit_BTN.png');
        game.load.image('start','assets/buttons/Start_BTN.png');
        game.load.image('rating','assets/buttons/Rating_BTN.png');
        game.load.image('backwards','assets/buttons/Backward_BTN.png');
        game.load.image('forward','assets/buttons/Forward_BTN.png');
        //game.load.image('+A','assets/buttons/Play_BTN_act.png');
        //game.load.image('-A','assets/buttons/Close_BTN_act.png');
        
        //Imagenes de rating
        game.load.image('ratingtable','assets/images/rating_window2.png');
        game.load.image('ratinglogo','assets/images/rating.png'); 
        
        //Imagenes de name y createRoom
        game.load.image('background','assets/images/stars.png');
        game.load.image('roombg','assets/images/buttongbg.png');
		game.load.image('window','assets/images/window.png');
		game.load.image('textinput','assets/images/textinput.png');
		game.load.image('gamemodebg','assets/images/gamemode.png'); 
		
		//Imagenes de game
		game.load.image('ammo','assets/images/ammo.png');
		game.load.image('recharge','assets/images/recharge.png');
		game.load.image('score','assets/images/Score.png');
		game.load.image('roomnamewindow','assets/images/roomname.png');
		game.load.image('health2','assets/spaceship/hp_bar_2.png');
		game.load.image('health1','assets/spaceship/hp_bar_1.png');
		game.load.image('healthbar','assets/images/healthbar.png');
		game.load.image('thrust','assets/images/thrustIcon.png');
		game.load.image('thrustR','assets/images/thrustIconLow.png');
		game.load.image('thrustY','assets/images/thrustIconAlert.png');
		game.load.image('thrustG','assets/images/thrustIconFull.png');
		game.load.image('victory','assets/images/victory_royale.png');
		
		//Imagenes de room
		game.load.image('ship','assets/buttons/Ship_BTN.png');
		game.load.image('hangar','assets/images/hangar.png');
		game.load.image('frame','assets/images/frame.png');
		game.load.image('chatroombg','assets/images/chat_room.png')
		
		//Imagenes de menu
		game.load.image('playersconexion','assets/images/players.png')
	},

	create : function() {
		
		var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
		
		var window = game.add.sprite(game.world.centerX, game.world.centerY, 'window');
        window.scale.setTo(0.5,0.5);
        window.anchor.setTo(0.5,0.5);
        
        game.global.chat.text = "Unido al chat global.";
        
        // connecting text
		var style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		var text = game.add.text(game.world.centerX, game.world.centerY, "Conectando...", style);
		text.anchor.set(0.5,0.5);
		
	},

	update : function() {

		if (typeof game.global.myPlayer.id !== 'undefined'){
			game.state.start('nameState')
		}
		
	}
}