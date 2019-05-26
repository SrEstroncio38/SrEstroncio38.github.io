Spacewar.gameState = function(game) {
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
	this.maxRecharges = 300 
	this.playerAmmo
	this.ammoButton
	this.thrustText
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

		// We preload the recharge sprites
		game.global.recharges = new Array(this.maxRecharges)
		for (var i = 0; i < this.maxRecharges; i++) {
			game.global.recharges[i] = {
				image : game.add.sprite(0, 0, 'recharge'),
			}
			game.global.recharges[i].image.anchor.setTo(0.5, 0.5)
			game.global.recharges[i].image.visible = false
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
		game.global.ui.scoreImg = game.add.sprite(1100,10,'score');
		game.global.ui.scoreImg.scale.setTo(0.3,0.3)	
		game.global.ui.scoreImg.fixedToCamera = true;
		game.global.ui.scoreText = game.add.text(1180,8, game.global.myPlayer.points, style);
		game.global.ui.scoreText.fixedToCamera = true;
		
		// print room name
		game.global.ui.roomImg = game.add.sprite(1280,640,'roomnamewindow');
		game.global.ui.roomImg.scale.setTo(0.4,0.4);
		game.global.ui.roomImg.anchor.set(1,1);
		game.global.ui.roomImg.fixedToCamera = true;
		style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		game.global.ui.roomLabel = game.add.text(1280 - 150,640 - 22, game.global.myPlayer.roomname, style);
		game.global.ui.roomLabel.anchor.set(0.5,0.5);
		game.global.ui.roomLabel.fixedToCamera = true;
		
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
		
		//print ammo icon
		game.global.ui.ammoButton = game.add.sprite(10,520, 'ammo');
		var style = { fontSize: "56px", fill: "#ff0000"};
		game.global.ui.ammoButton.addChild(game.global.ui.ammoText = game.add.text(110,110, game.global.myPlayer.ammo, style));
		game.global.ui.ammoText.anchor.set(0.5,0.5);
		game.global.ui.ammoButton.inputEnabled = true;		
		game.global.ui.ammoButton.fixedToCamera = true;
		game.global.ui.ammoButton.scale.setTo(0.5,0.5);
		
		//print thrust icon
		game.global.ui.thrustButton = game.add.sprite(138,520, 'thrust');
		game.global.ui.thrustButton.fixedToCamera = true;
		game.global.ui.thrustButtonR = game.add.sprite(138,520, 'thrustR');
		game.global.ui.thrustButtonR.fixedToCamera = true;
		game.global.ui.thrustButtonY = game.add.sprite(138,520, 'thrustY');
		game.global.ui.thrustButtonY.fixedToCamera = true;
		game.global.ui.thrustButtonG = game.add.sprite(138,520, 'thrustG');
		game.global.ui.thrustButtonG.fixedToCamera = true;
		var style2 = {fontSize: "24px", fill: "#ffffff", align: "center"};
		this.thrustText = game.add.text(188,572, game.global.myPlayer.thrust, style2);
		this.thrustText.fixedToCamera = true;
		this.thrustText.anchor.set(0.5,0.5);		
		
		//print ui health bar
		game.global.ui.healthBar = game.add.sprite(10,10, 'healthbar');
		game.global.ui.healthBar.fixedToCamera = true;
		game.global.ui.healthBar.scale.setTo(0.7,0.7);
		game.global.ui.currentHealth = game.add.sprite(18,18,'health1');
		game.global.ui.currentHealth.fixedToCamera = true;
		game.global.ui.currentHealth.scale.setTo(1,1);
		
		// print death message
		style = { font: "128px Arial", fill: "#ff4444", align: "center" };
		game.global.ui.deathText = game.add.text(640, 320, "Git Gud", style);
		game.global.ui.deathText.alpha = 0.0;
		game.global.ui.deathText.anchor.set(0.5,1.5);
		game.global.ui.deathText.fixedToCamera = true;
		
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

		//update ammo text
		if (this.bulletIsFired){
			game.global.ui.ammoText.setText(game.global.myPlayer.ammo.toString())
		}

		//update thrust text
		if (game.global.myPlayer.thrust>1){
			this.thrustText.setText(Math.trunc(game.global.myPlayer.thrust).toString())
			if (game.global.myPlayer.thrust>50)
				this.thrustText.setStyle({fontSize: "24px", fill: "#ffffff", align: "center"} )
			else if (game.global.myPlayer.thrust>25)
				this.thrustText.setStyle({fontSize: "24px", fill: "#0000ff", align: "center"} )
			else
				this.thrustText.setStyle({fontSize: "24px", fill: "#000000", align: "center"} )
		}
		else{
			this.thrustText.setText("NO\n FUEL")
			this.thrustText.setStyle({fontSize: "18px", fill: "#ff0000", align: "center"} )
		}
			
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
		}
		game.global.socket.send(JSON.stringify(msg))
	}
}