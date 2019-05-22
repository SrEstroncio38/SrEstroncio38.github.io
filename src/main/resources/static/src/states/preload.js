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
		
		game.load.image('health2','assets/spaceship/hp_bar_2.png');
		game.load.image('health1','assets/spaceship/hp_bar_1.png');
		//Imagenes del lobby
		game.load.image('lobby','assets/images/lobby.png');
        game.load.image('+','assets/buttons/Play_BTN.png');
        game.load.image('-','assets/buttons/Close_BTN.png');
        game.load.image('start','assets/buttons/Start_BTN.png');
        //game.load.image('+A','assets/buttons/Play_BTN_act.png');
        //game.load.image('-A','assets/buttons/Close_BTN_act.png');
        //Imagenes de name
        game.load.image('background','assets/images/stars.png');
        game.load.image('roombg','assets/images/buttongbg.png');
		game.load.image('window','assets/images/window.png');
		game.load.image('textinput','assets/images/textinput.png');
	},

	create : function() {
		game.state.start('nameState')
	},

	update : function() {

	}
}