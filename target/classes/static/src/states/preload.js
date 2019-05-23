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
        game.load.image('backwards','assets/buttons/Backward_BTN.png');
        game.load.image('forward','assets/buttons/Forward_BTN.png');
        //game.load.image('+A','assets/buttons/Play_BTN_act.png');
        //game.load.image('-A','assets/buttons/Close_BTN_act.png');
        
        //Imagenes de name y createRoom
        game.load.image('background','assets/images/stars.png');
        game.load.image('roombg','assets/images/buttongbg.png');
		game.load.image('window','assets/images/window.png');
		game.load.image('textinput','assets/images/textinput.png');
		
		//Imagenes de game
		game.load.image('ammo','assets/images/ammo.png');
		game.load.image('score','assets/images/Score.png');
		game.load.image('roomnamewindow','assets/images/roomname.png');
		game.load.image('health2','assets/spaceship/hp_bar_2.png');
		game.load.image('health1','assets/spaceship/hp_bar_1.png');
		game.load.image('healthbar','assets/images/healthbar.png');
		
		//Imagenes de room
		game.load.image('ship','assets/buttons/Ship_BTN.png');
		game.load.image('hangar','assets/images/hangar.png')
	},

	create : function() {
		
		var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
		
		var window = game.add.sprite(game.world.centerX, game.world.centerY, 'window');
        window.scale.setTo(0.5,0.5);
        window.anchor.setTo(0.5,0.5);
        
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