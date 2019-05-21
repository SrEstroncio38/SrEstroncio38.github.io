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
	},

	create : function() {
		game.state.start('menuState')
	},

	update : function() {

	}
}