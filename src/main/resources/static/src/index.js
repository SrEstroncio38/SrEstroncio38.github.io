window.onload = function() {

	game = new Phaser.Game(1280, 640, Phaser.AUTO, 'gameDiv')

	// GLOBAL VARIABLES
	game.global = {
		FPS : 30,
		DEBUG_MODE : true,
		socket : null,
		myPlayer : new Object(),
		otherPlayers : [],
		projectiles : [],
		deathText : null
	}

	// WEBSOCKET CONFIGURATOR
	game.global.socket = new WebSocket("ws://127.0.0.1:8080/spacewar")
	
	game.global.socket.onopen = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection opened.')
		}
	}

	game.global.socket.onclose = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection closed.')
		}
	}
	
	game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)
		
		switch (msg.event) {
		case 'JOIN':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] JOIN message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.id = msg.id
			game.global.myPlayer.shipType = msg.shipType
			game.global.myPlayer.username = msg.username
			game.global.myPlayer.ammo = msg.ammo
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ID assigned to player: ' + game.global.myPlayer.id)
			}
			break
		case 'NEW ROOM' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] NEW ROOM message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.room = {
					name : msg.room
			}
			break
		case 'GAME STATE UPDATE' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] GAME STATE UPDATE message recieved')
				console.dir(msg)
			}
			
			if (typeof game.global.myPlayer.image !== 'undefined') {
				for (var player of msg.players) {
					if (game.global.myPlayer.id == player.id) {
						game.global.myPlayer.image.x = player.posX
						game.global.myPlayer.image.y = player.posY
						game.global.myPlayer.image.angle = player.facingAngle
						game.global.myPlayer.userNLabel.x = player.posX
						game.global.myPlayer.userNLabel.y = player.posY
						game.global.myPlayer.health2.x = player.posX - 50
						game.global.myPlayer.health2.y = player.posY
						game.global.myPlayer.healthValue = player.health
						var scale = player.health/100.0
						game.global.myPlayer.health1.scale.setTo(scale, 1)
						game.global.myPlayer.health1.x = player.posX - 50
						game.global.myPlayer.health1.y = player.posY
						game.global.myPlayer.userNLabel.setText(game.global.myPlayer.room.name);
						if (player.death) {
							game.global.myPlayer.image.alpha = 0.25
							game.global.myPlayer.userNLabel.alpha = 0.0
							game.global.myPlayer.health2.alpha = 0.0
							game.global.myPlayer.health1.alpha = 0.0
							game.global.deathText.alpha = 1.0
						}
					} else {
						if (typeof game.global.otherPlayers[player.id] == 'undefined') {
							game.global.otherPlayers[player.id] = {
									image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType),
									username: player.username,
									userNLabel: game.add.text(0, 0, player.username, { font: "16px Arial", fill: "#ff8888", align: "center" }),
									healthValue: player.health,
									health2: game.add.sprite(0, 0, 'health2'),
									health1: game.add.sprite(0, 0, 'health1')
							}
							game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
							game.global.otherPlayers[player.id].userNLabel.anchor.setTo(0.5, 2.5)
							game.global.otherPlayers[player.id].health2.anchor.setTo(0, 3.5)
							game.global.otherPlayers[player.id].health1.anchor.setTo(0, 3.5)
							game.global.otherPlayers[player.id].health2.scale.setTo(1, 1)
							game.global.otherPlayers[player.id].health1.scale.setTo(1, 1)
						} else {
							game.global.otherPlayers[player.id].image.x = player.posX
							game.global.otherPlayers[player.id].image.y = player.posY
							game.global.otherPlayers[player.id].image.angle = player.facingAngle
							game.global.otherPlayers[player.id].userNLabel.x = player.posX
							game.global.otherPlayers[player.id].userNLabel.y = player.posY
							game.global.otherPlayers[player.id].userNLabel.setText(player.username)
							game.global.otherPlayers[player.id].health2.x = player.posX - 50
							game.global.otherPlayers[player.id].health2.y = player.posY
							game.global.otherPlayers[player.id].healthValue = player.health
							var scale = player.health/100.0
							game.global.otherPlayers[player.id].health1.scale.setTo(scale, 1)
							game.global.otherPlayers[player.id].health1.x = player.posX - 50
							game.global.otherPlayers[player.id].health1.y = player.posY
							if (player.death) {
								game.global.otherPlayers[player.id].image.alpha = 0.25
								game.global.otherPlayers[player.id].userNLabel.alpha = 0.0
								game.global.otherPlayers[player.id].health2.alpha = 0.0
								game.global.otherPlayers[player.id].health1.alpha = 0.0
							}
						}
					}
				}
				
				for (var projectile of msg.projectiles) {
					if (projectile.isAlive) {
						game.global.projectiles[projectile.id].image.x = projectile.posX
						game.global.projectiles[projectile.id].image.y = projectile.posY
						if (game.global.projectiles[projectile.id].image.visible === false) {
							game.global.projectiles[projectile.id].image.angle = projectile.facingAngle
							game.global.projectiles[projectile.id].image.visible = true
						}
					} else {
						if (projectile.isHit) {
							// we load explosion
							let explosion = game.add.sprite(projectile.posX, projectile.posY, 'explosion')
							explosion.animations.add('explosion')
							explosion.anchor.setTo(0.5, 0.5)
							explosion.scale.setTo(2, 2)
							explosion.animations.play('explosion', 15, false, true)
						}
						game.global.projectiles[projectile.id].image.visible = false
					}
				}
			}
			break
		case 'REMOVE PLAYER' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] REMOVE PLAYER message recieved')
				console.dir(msg.players)
			}
			game.global.otherPlayers[msg.id].image.destroy()
			game.global.otherPlayers[msg.id].userNLabel.destroy()
			game.global.otherPlayers[msg.id].health2.destroy()
			game.global.otherPlayers[msg.id].health1.destroy()
			delete game.global.otherPlayers[msg.id]
		default :
			console.dir(msg)
			break
		}
	}

	// PHASER SCENE CONFIGURATOR
	game.state.add('bootState', Spacewar.bootState)
	game.state.add('preloadState', Spacewar.preloadState)
	game.state.add('menuState', Spacewar.menuState)
	game.state.add('lobbyState', Spacewar.lobbyState)
	game.state.add('nameState', Spacewar.nameState)
	game.state.add('matchmakingState', Spacewar.matchmakingState)
	game.state.add('roomState', Spacewar.roomState)
	game.state.add('gameState', Spacewar.gameState)

	game.state.start('bootState')

}