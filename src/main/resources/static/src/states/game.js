Spacewar.gameState = function(game) {
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
	this.playerAmmo
	this.ammoButton
	this.ammoText
	this.bulletIsFired = false
}

Spacewar.gameState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **GAME** state");
		}
		//print world size
		game.world.setBounds(0, 0, 1920, 1920);
	},

	preload : function() {
		game.load.image('ammo','assets/images/ammo.png');
		
		// We create a procedural starfield background
		for (var i = 0; i < this.numStars; i++) {
			let sprite = game.add.sprite(game.world.randomX,
					game.world.randomY, 'spacewar', 'staralpha.png');
			let random = game.rnd.realInRange(0, 0.6);
			sprite.scale.setTo(random, random)
		}

		// We preload the bullets pool
		game.global.proyectiles = new Array(this.maxProjectiles)
		for (var i = 0; i < this.maxProjectiles; i++) {
			game.global.projectiles[i] = {
				image : game.add.sprite(0, 0, 'spacewar', 'projectile.png')
			}
			game.global.projectiles[i].image.anchor.setTo(0.5, 0.5)
			game.global.projectiles[i].image.visible = false
		}

		// we load a random ship
		let random = [ 'blue', 'darkgrey', 'green', 'metalic', 'orange',
				'purple', 'red' ]
		let randomImage = random[Math.floor(Math.random() * random.length)]
				+ '_0' + (Math.floor(Math.random() * 6) + 1) + '.png'
		game.global.myPlayer.image = game.add.sprite(0, 0, 'spacewar',
				game.global.myPlayer.shipType)
		game.global.myPlayer.image.anchor.setTo(0.5, 0.5)
		
		// print usernames
		var style = { font: "16px Arial", fill: "#ffffff", align: "center" };
		game.global.myPlayer.userNLabel = game.add.text(0, 0, game.global.myPlayer.username, style);
		game.global.myPlayer.userNLabel.anchor.set(0.5,2.5);
		
		// print healthbars
		game.load.image('health2','assets/images/hp_bar_2.png');
		game.global.myPlayer.health2 = game.add.sprite(0, 0, 'health2')
		game.global.myPlayer.health2.anchor.set(0,3.5);
		game.global.myPlayer.health2.scale.setTo(1,1);
		game.load.image('health2','assets/images/hp_bar_1.png');
		game.global.myPlayer.health1 = game.add.sprite(0, 0, 'health1')
		game.global.myPlayer.health1.anchor.set(0,3.5);
		game.global.myPlayer.health1.scale.setTo(1,1);
	},

	create : function() {
		this.bulletTime = 0
		this.fireBullet = function() {
			if (game.time.now > this.bulletTime && game.global.myPlayer.ammo > 0) {
				this.bulletTime = game.time.now + 250;
				game.global.myPlayer.ammo -= 1;
				this.playerAmmo = game.global.myPlayer.ammo - 1;
				// this.weapon.fire()
				this.bulletIsFired = true;
				return true
			} else {
				this.playerAmmo = game.global.myPlayer.ammo;
				return false
			}
		}

		this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		// Stop the following keys from propagating up to the browser
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W,
				Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D,
				Phaser.Keyboard.SPACEBAR ]);

		game.camera.follow(game.global.myPlayer.image);
		
		ammoButton = game.add.sprite(10,10, 'ammo');
		var style = { fontSize: "48px", fill: "#ff0000"};
		ammoButton.addChild(this.ammoText = game.add.text(95,80, game.global.myPlayer.ammo.toString(), style));
		ammoButton.inputEnabled = true;		
		ammoButton.fixedToCamera = true;
		ammoButton.scale.setTo(0.6,0.6);
		
		var style = { font: "128px Arial", fill: "#ff4444", align: "center" };
		game.global.deathText = game.add.text(640, 320, "Git Gud", style);
		game.global.deathText.alpha = 0.0;
		game.global.deathText.anchor.set(0.5,0.5);
		game.global.deathText.fixedToCamera = true;
		
		
	},

	update : function() {
		let msg = new Object()
		msg.event = 'UPDATE MOVEMENT'

		msg.movement = {
			thrust : false,
			brake : false,
			rotLeft : false,
			rotRight : false
		}

		msg.bullet = false

		if (this.wKey.isDown)
			msg.movement.thrust = true;
		if (this.sKey.isDown)
			msg.movement.brake = true;
		if (this.aKey.isDown)
			msg.movement.rotLeft = true;
		if (this.dKey.isDown)
			msg.movement.rotRight = true;
		if (this.spaceKey.isDown) {
			msg.bullet = this.fireBullet()
			msg.ammo = this.playerAmmo;
		}

		//update ammo icon
		if (this.bulletIsFired){
			this.ammoText.destroy();
			var style = { fontSize: "48px", fill: "#ff0000"};
			ammoButton.addChild(this.ammoText = game.add.text(95,80, game.global.myPlayer.ammo.toString(), style));
		}

		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
		}
		game.global.socket.send(JSON.stringify(msg))
	}
}