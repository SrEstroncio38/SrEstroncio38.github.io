Spacewar.lobbyState = function(game) {
	this.room = [null, null, null, null];
	this.roomtext = [null, null, null, null];
	this.currentpage;
}

//Funcion para entrarEnMatchMaking
function enterMatchMaking(){

    //game.state.start('matchmakingState');
}

function advancePage() {
	currentpage += 1;
}

function returnPage() {
	currentpage -= 1;
}

function joinRoom(item) {
	if (item.variable != "") {
		let message = {
				event : 'JOIN ROOM',
				room: item.variable
			}
		game.global.socket.send(JSON.stringify(message))
	}
}

//Funcion que te entra en una sala
function CreateRoom(){
	game.state.start('createRoom');
}

function goToMenu(){

	game.state.start('menuState');
}


Spacewar.lobbyState.prototype = {

    init : function() {
        if (game.global.DEBUG_MODE) {
            console.log("[DEBUG] Entering LOBBY state");
        }

        //game.world.setBounds(0, 0, 1920, 1920);
    },

    preload : function() {

    	currentpage = 0;

    },

    create : function() {
    	
    	//fijamos background
    	bg = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
    	bg.anchor.setTo(0.5,0.5);
    	
    	//Añadimos la imagen del looby
        lobby = game.add.sprite(game.world.centerX, game.world.centerY, 'lobby');
        lobby.scale.setTo(0.8,0.8);
        lobby.anchor.setTo(0.5,0.5);
        
        //Añadimos boton de añadir sala
        lobby.addChild(addRoom = game.add.button(0+150,0-60, 'addroom', CreateRoom, this, 2, 1, 0));
        addRoom.scale.setTo(0.6, 0.6);
        
        //Añadimos el boton de cerrar (sin funcion aun)
        lobby.addChild( close = game.add.button(0+150,0+240, 'exit', goToMenu , this, 2, 1, 0));
        close.scale.setTo(0.6, 0.6);
        
        //Añadimos el boton de Matchmaking
        lobby.addChild(start = game.add.button(0+150,0-160, 'start', enterMatchMaking , this, 2, 1, 0));
        start.scale.setTo(0.6, 0.6);
        
        //Añadimos 4 botones de Room
        var style = { font: "20px Arial", fill: "#ffffff", align: "center" };
        lobby.addChild(this.room[0] = game.add.button(-160,-130, 'roombg', joinRoom, this, 2, 1, 0));
        this.room[0].variable = "";
        this.room[0].anchor.setTo(0.5, 0.5);
        this.room[0].addChild(this.roomtext[0] = game.add.text(0, 0, "", style));
        this.roomtext[0].anchor.set(0.5,0.5);
        lobby.addChild(this.room[1] = game.add.button(-160,-30, 'roombg', joinRoom, this, 2, 1, 0));
        this.room[1].variable = "";
        this.room[1].anchor.setTo(0.5, 0.5);
        this.room[1].addChild(this.roomtext[1] = game.add.text(0, 0, "", style));
        this.roomtext[1].anchor.set(0.5,0.5);
        lobby.addChild(this.room[2] = game.add.button(-160,70, 'roombg', joinRoom, this, 2, 1, 0));
        this.room[2].variable = "";
        this.room[2].anchor.setTo(0.5, 0.5);
        this.room[2].addChild(this.roomtext[2] = game.add.text(0, 0, "", style));
        this.roomtext[2].anchor.set(0.5,0.5);
        lobby.addChild(this.room[3] = game.add.button(-160,170, 'roombg', joinRoom, this, 2, 1, 0));
        this.room[3].variable = "";
        this.room[3].anchor.setTo(0.5, 0.5);
        this.room[3].addChild(this.roomtext[3] = game.add.text(0, 0, "", style));
        this.roomtext[3].anchor.set(0.5,0.5);
        
        //Añadimos el boton de avanzar y retroceder
        lobby.addChild(forward = game.add.button(0,220, 'forward', advancePage, this));
        forward.scale.setTo(0.3, 0.3);
        lobby.addChild(backwards = game.add.button(-380,220, 'backwards', returnPage, this));
        backwards.scale.setTo(0.3, 0.3);
        
        //Añadimos las palabras lobby
        style = { font: "45px Arial", fill: "#ffffff", align: "center" };
        lobby.addChild(lText = game.add.text(0, -310, "LOBBY", style));
        lText.anchor.setTo(0.5,0.5);

    },

    update : function() {
    	
    	if (currentpage >= parseInt((game.global.rooms["name"].length-1) / 4)) {
    		currentpage = parseInt((game.global.rooms["name"].length-1) / 4);
    	}
    	if (currentpage < 0) {
    		currentpage = 0;
    	}
    	
    	let numberRooms = game.global.rooms["name"].length
    	let index = 0;
    	
    	for (var i = 0; i < 4; i++) {
	    	index = currentpage * 4 + i;
			if (numberRooms > index) {
				this.room[i].x = -160;
                this.roomtext[i].setText("Sala: "+game.global.rooms["name"][index] +
                    "   "+game.global.rooms["currentplayers"][index]+"/"+game.global.rooms["maxplayers"][index]);
				this.room[i].variable = game.global.rooms["name"][index];
			} else {
				this.room[i].x = -5000;
				this.roomtext[i].setText("");
				this.room[i].variable = "";
			}
    	}
    	
    },




}