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
		game.global.myPlayer.userNLabel.z = -10
		
		// print healthbars
		game.global.myPlayer.health2 = game.add.sprite(0, 0, 'health2')
		game.global.myPlayer.health2.anchor.set(0,3.5);
		game.global.myPlayer.health2.scale.setTo(1,1);
		game.global.myPlayer.health1 = game.add.sprite(0, 0, 'health1')
		game.global.myPlayer.health1.anchor.set(0,3.5);
		game.global.myPlayer.health1.scale.setTo(1,1);
		
		// print points
		var style = { font: "16px Arial", fill: "#ffffff", align: "center" };
		var scoreImg = game.add.sprite(1100,10,'score');
		scoreImg.scale.setTo(0.3,0.3)	
		scoreImg.fixedToCamera = true;
		game.global.myPlayer.scoreText = game.add.text(1180,8, game.global.myPlayer.points, style);
		game.global.myPlayer.scoreText.fixedToCamera = true;
		
		// print room name
		var roomImg = game.add.sprite(1280,640,'roomnamewindow');
		roomImg.scale.setTo(0.4,0.4);
		roomImg.anchor.set(1,1);
		roomImg.fixedToCamera = true;
		style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		game.global.myPlayer.roomLabel = game.add.text(1280 - 150,640 - 22, game.global.myPlayer.roomname, style);
		game.global.myPlayer.roomLabel.anchor.set(0.5,0.5);
		game.global.myPlayer.roomLabel.fixedToCamera = true;
		
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
		ammoButton.addChild(this.ammoText = game.add.text(110,110, game.global.myPlayer.ammo, style));
		this.ammoText.anchor.set(0.5,0.5);
		ammoButton.inputEnabled = true;		
		ammoButton.fixedToCamera = true;
		ammoButton.scale.setTo(0.6,0.6);
		
		// print death message
		style = { font: "128px Arial", fill: "#ff4444", align: "center" };
		game.global.deathText = game.add.text(640, 320, "Git Gud", style);
		game.global.deathText.alpha = 0.0;
		game.global.deathText.anchor.set(0.5,1.5);
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
			this.ammoText.setText(game.global.myPlayer.ammo.toString())
		}

		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
		}
		game.global.socket.send(JSON.stringify(msg))
	}
}