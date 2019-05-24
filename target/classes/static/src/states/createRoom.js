Spacewar.createRoom = function(game) {
	this.roomname
	this.deletingText
	
}

function selectClassic(){
	game.global.myPlayer.gamemode = "Classic"
}

function selectBattleRoyal(){
	game.global.myPlayer.gamemode = "BattleRoyal"
}

Spacewar.createRoom.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **createRoom** state");
		}
	},

	preload : function() {		
		game.global.myPlayer.gamemode = ""
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.backKey = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
		
	},

	create : function() {
		
		//Colocamos el background
		var bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
		
    	//Colocamos la ventana
		var window = game.add.sprite(game.world.centerX, game.world.centerY, 'window');
        window.scale.setTo(0.5,0.5);
        window.anchor.setTo(0.5,0.5);
        
        //Colocamos el input
        var textbox = game.add.sprite(game.world.centerX, game.world.centerY + 20, 'textinput');
        textbox.scale.setTo(1,0.5);
        textbox.anchor.setTo(0.5,0.5);
		
		// add room name
		var style = { font: "24px Arial", fill: "#ffffff", align: "center" };
		var text = game.add.text(game.world.centerX, game.world.centerY - 50, "Escribe nombre de sala:", style);
		text.anchor.set(0.5,0.5);
		game.global.myPlayer.roomname = "";
		roomname = game.add.text(game.world.centerX, game.world.centerY + 20, game.global.myPlayer.roomname, style);
		roomname.anchor.set(0.5,0.5);
		
		//Colocamos boton classic
		var style2 = { font: "20px Arial", fill: "#ffffff", align: "center" };
		classic = game.add.button(game.world.centerX - 150, game.world.centerY + 170, 'roombg',selectClassic, 2, 1, 0);
		classic.scale.setTo(0.5,0.5);
		classic.anchor.setTo(0.5,0.5)
		t1 = game.add.text(game.world.centerX - 150, game.world.centerY + 175, "Classic" , style2);
		t1.anchor.setTo(0.5,0.5)
		
		//Colocamos boton Battle royal
		var style2 = { font: "20px Arial", fill: "#ffffff", align: "center" };
		BTR = game.add.button(game.world.centerX + 150, game.world.centerY + 170, 'roombg',selectBattleRoyal, 2, 1, 0);
		BTR.scale.setTo(0.5,0.5);
		BTR.anchor.setTo(0.5,0.5)
		t2 = game.add.text(game.world.centerX + 150, game.world.centerY + 175, "BattleRoyal" , style2);
		t2.anchor.setTo(0.5,0.5)
		
		//Texto modo de juego
		t3 = game.add.text(game.world.centerX, game.world.centerY + 235, "Modo elegido:" , style);
		t3.anchor.setTo(0.5,0.5)
		t3 = game.add.text(game.world.centerX, game.world.centerY + 265, game.global.myPlayer.gamemode , style);
		t3.anchor.setTo(0.5,0.5)
		
		deletingText = false;
		
	},

	update : function() {
		t3.text = game.global.myPlayer.gamemode
		if (this.backKey.isDown){
			if (!deletingText) {
				game.global.myPlayer.roomname = game.global.myPlayer.roomname.substring(0,game.global.myPlayer.roomname.length-1);
				deletingText = true;
			}
		} else {
			game.input.keyboard.addCallbacks(this, null, null, function (char) {
				if (game.global.myPlayer.roomname.length < 16)
					game.global.myPlayer.roomname += char;
			});
			deletingText = false;
		}
		roomname.text = game.global.myPlayer.roomname;

		if (this.enterKey.isDown && game.global.myPlayer.gamemode != ""){
			let message = {
					event : 'CREATE ROOM',
					roomname: game.global.myPlayer.roomname,
					gamemode: game.global.myPlayer.gamemode
				}
				game.global.socket.send(JSON.stringify(message))
		
				
		/*game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)
		switch (msg.event) {
		case 'GO TO ROOM':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] GO TO ROOM message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.roomname = msg.roomname
			game.state.start('roomState')
			break;
		default:
			break;
		}
		}*/
				game.state.start('roomState');
		}
	}
}