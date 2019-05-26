package spacewar;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class GameRoom {

	ObjectMapper mapper = new ObjectMapper();
	private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
	
	//Variables de los players
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>();
	private Map<Integer, Recharge> recharges = new ConcurrentHashMap<>();
	private AtomicInteger numPlayers = new AtomicInteger();
	private final int MAXPLAYERS;
	
	//Locks
	private Lock playersLock = new ReentrantLock();
	
	//Atributos de la room
	private final String roomName;
	private final String GameMode;
	private Player roomCreator;
	private AtomicBoolean isActive = new AtomicBoolean(false);

	//Constructor
	public GameRoom(String roomName, String GameModeRef) {
		this.roomName = roomName;
		this.GameMode = GameModeRef;
		this.isActive.set(false);
		switch (GameMode) {
			case "Classic":
				MAXPLAYERS = 2;
				break;
			case "BattleRoyal":
				MAXPLAYERS = 20;
				break;
			default:
				MAXPLAYERS = 4;
		}
	}
	
	/********************************
	 * 		FUNCIONES PLAYER		*
	 ********************************/
	
	//Devuelve el numero de players
	public int getNumPlayers() {
		return numPlayers.get();
	}
	
	//Devuelve el nombre de la sala
	public String getRoomName() {
		return roomName;
	}
	
	//Devuelve el numero maximo de jugadores de la sala
	public int getMaxPlayers() {
		return this.MAXPLAYERS;
	}
	
	//Añade un jugador a la sala si es que cabe
	public boolean addPlayer(Player player) {
		boolean result = false;
		//Revisa que quepan los jugadores antes de agregarlo
		playersLock.lock();
		if(numPlayers.get() < MAXPLAYERS) {
			players.put(player.getSession().getId(), player);
			if (numPlayers.getAndIncrement() < 1) {
				roomCreator = player;
			}
			result = true;
		}
		playersLock.unlock();
		
		//Este mensaje se encuentra index.js
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "NUM PLAYERS IN ROOM");
		msg.put("numplayers", numPlayers.get());
		msg.put("maxplayers", MAXPLAYERS);
		msg.put("gamemode", GameMode);
		broadcast(msg.toString());
		return result;
	}
	
	//Devuelve los jugadores de la sala
	public Collection<Player> getPlayers() {
		return players.values();
	}
	
	/*
	 * Elimina un jugador de la sala comprobando que sea o no su creador
	 * si es así, elimina la sala notificando de salida a TODOS LOS DE LA SALA
	 */
	public boolean removePlayer(Player player) {
		boolean result = false;
		playersLock.lock();
		int count = this.numPlayers.get();
		if(players.remove(player.getSession().getId()) != null) {
			count = this.numPlayers.decrementAndGet();
		}
		playersLock.unlock();
		if (count <= 0) {
			result = true;
		}
		if (player.getPlayerId() == roomCreator.getPlayerId()) {
			result = true;
		}
		
		//Este mensaje se recibe en index.js
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "NUM PLAYERS IN ROOM");
		msg.put("numplayers", numPlayers.get());
		msg.put("maxplayers", MAXPLAYERS);
		msg.put("gamemode", GameMode);
		broadcast(msg.toString());
		return result;
	}
	
	//Devuelve si la partida a comenzado o no
	public boolean isRoomActive() {
		return isActive.get();
	}
	
	//Devuelve si el jugador pasado como argumento es el dueño de la sala
	public boolean isRoomOwner(Player player) {
		if (roomCreator.getPlayerId() == player.getPlayerId()) {
			return true;
		}
		return false;
	}

	/********************************
	 * 			PROYECTILES			*
	 ********************************/
	
	//Añade proyectiles
	public void addProjectile(int id, Projectile projectile) {
		projectiles.put(id, projectile);
	}
	
	//Devuelve los proyectiles
	public Collection<Projectile> getProjectiles() {
		return projectiles.values();
	}
	
	//Elimna un proyectil
	public void removeProjectile(Projectile projectile) {
		players.remove(projectile.getId(), projectile);
	}
	
	/********************************
	 * 			RECARGAS			*
	 ********************************/	

	//Añade recargas
	public void addRecharge(int id, Recharge recharge) {
		recharges.put(id, recharge);
	}
	
	//Devuelve las recargas
	public Collection<Recharge> getRecharges() {
		return recharges.values();
	}
	
	//Elimna una recarga
	public void removeRecharge(Recharge recharge) {
		players.remove(recharge.getId(), recharge);
	}

	/********************************
	 * 		FUNCIONES DE SALA		*
	 ********************************/
	
	//Comienza la partida y su correspondiente hilo
	public void startGameLoop() {
		this.isActive.set(true);
		scheduler = Executors.newScheduledThreadPool(1);
		scheduler.scheduleAtFixedRate(() -> tick(), SpacewarGame.TICK_DELAY, SpacewarGame.TICK_DELAY, TimeUnit.MILLISECONDS);
	}
	
	//Termina la partida y su correspondiente hilo
	public void stopGameLoop() {
		if (scheduler != null) {
			scheduler.shutdown();
			this.isActive.set(false);
		}
	}
	
	
	/********************************
	 * 		  NOTIFICACIONES		*
	 ********************************/
	
	//Envia un mensaje a todos los jugadores de la sala cuando uno de ellos entra a endGame.js
	public void notifyScoreList() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodeScore = mapper.createArrayNode();
		
		try {
			for (Player player : this.getPlayers()) {
				ObjectNode jsonScore = mapper.createObjectNode();
				jsonScore.put("id", player.getPlayerId());
				jsonScore.put("username", player.getUsername());
				jsonScore.put("points", player.getPoints());
				arrayNodeScore.addPOJO(jsonScore);
			}
			//mensaje tratado en index.js
			json.put("event", "UPDATE SCORES END GAME");
			json.putPOJO("scores", arrayNodeScore);
			
			this.broadcast(json.toString());
		} catch (Throwable ex) {
			
		}
		
	}
	
	/********************************
	 * 			BROADCAST			*
	 ********************************/
	
	//Envia un mensaje a todos los jugadores de la sala
	public void broadcast(String message) {
		for (Player player : getPlayers()) {
			try {
				player.getSession().sendMessage(new TextMessage(message.toString()));
			} catch (Throwable ex) {
				System.err.println("Execption sending message to player " + player.getSession().getId() + "[" + player.getUsername() + "]");
				ex.printStackTrace(System.err);
				this.removePlayer(player);
			}
		}
	}
	
	/********************************
	 * 		FUNCIONES DE PARTIDA	*
	 ********************************/
	
	//Actualiza la partida en cada "tick" de reloj
	private void tick() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodePlayers = mapper.createArrayNode();
		ArrayNode arrayNodeProjectiles = mapper.createArrayNode();
		ArrayNode arrayNodeRecharges = mapper.createArrayNode();

		long thisInstant = System.currentTimeMillis();
		Set<Integer> bullets2Remove = new HashSet<>();
		Set<Integer> recharges2Remove = new HashSet<>();
		boolean removeBullets = false;
		boolean removeRecharges = false;

		try {
			// Update players
			for (Player player : getPlayers()) {
				player.calculateMovement();
				ObjectNode jsonPlayer = mapper.createObjectNode();
				jsonPlayer.put("id", player.getPlayerId());
				jsonPlayer.put("shipType", player.getShipType());
				jsonPlayer.put("username", player.getUsername());
				jsonPlayer.put("health", player.getHealth());
				jsonPlayer.put("ammo", player.getAmmo());
				jsonPlayer.put("thrust", player.getThrust());
				jsonPlayer.put("points", player.getPoints());
				jsonPlayer.put("death", player.getDeath());
				jsonPlayer.put("posX", player.getPosX());
				jsonPlayer.put("posY", player.getPosY());
				jsonPlayer.put("facingAngle", player.getFacingAngle());
				arrayNodePlayers.addPOJO(jsonPlayer);
			}

			// Update bullets and handle collision
			for (Projectile projectile : getProjectiles()) {
				projectile.applyVelocity2Position();

				// Handle collision
				for (Player player : getPlayers()) {
					if ((projectile.getOwner().getPlayerId() != player.getPlayerId()) && player.intersect(projectile) && !player.getDeath()) {
						// System.out.println("Player " + player.getPlayerId() + " was hit!!!");
						projectile.setHit(true);
						projectile.getOwner().addPoints(10);
						player.addHealth(-10);
						if (player.getHealth() <= 0) {
							player.setDeath(true);
						}
						break;
					}
				}

				ObjectNode jsonProjectile = mapper.createObjectNode();
				jsonProjectile.put("id", projectile.getId());

				if (!projectile.isHit() && projectile.isAlive(thisInstant)) {
					jsonProjectile.put("posX", projectile.getPosX());
					jsonProjectile.put("posY", projectile.getPosY());
					jsonProjectile.put("facingAngle", projectile.getFacingAngle());
					jsonProjectile.put("isAlive", true);
				} else {
					removeBullets = true;
					bullets2Remove.add(projectile.getId());
					jsonProjectile.put("isAlive", false);
					if (projectile.isHit()) {
						jsonProjectile.put("isHit", true);
						jsonProjectile.put("posX", projectile.getPosX());
						jsonProjectile.put("posY", projectile.getPosY());
					}
				}
				arrayNodeProjectiles.addPOJO(jsonProjectile);
			}

			if (removeBullets)
				this.projectiles.keySet().removeAll(bullets2Remove);
			
			//Update recharges
			for (Recharge recharge : getRecharges()) {
				//Handle collision
				for (Player player : getPlayers()) {
					if (player.intersect(recharge) && !player.getDeath()) {
						// System.out.println("Player " + player.getPlayerId() + " got bullets!!!");
						player.fillAmmo();
						recharge.setHit(true);
						break;
					}
				}
				ObjectNode jsonRecharge = mapper.createObjectNode();
				jsonRecharge.put("id", recharge.getId());
				if(!recharge.isHit() && recharge.isAlive(thisInstant))
					jsonRecharge.put("isAlive", true);
				else{
					removeRecharges = true;
					recharges2Remove.add(recharge.getId());
					jsonRecharge.put("isAlive", false);
				}
				jsonRecharge.put("posX", recharge.getPosX());
				jsonRecharge.put("posY", recharge.getPosY());
				arrayNodeRecharges.addPOJO(jsonRecharge);
			}
			
			if (removeRecharges)
				this.recharges.keySet().removeAll(recharges2Remove);
			
			
			//Este mensaje se encuentra en index.js
			json.put("event", "GAME STATE UPDATE");
			json.putPOJO("players", arrayNodePlayers);
			json.putPOJO("projectiles", arrayNodeProjectiles);
			json.putPOJO("recharges", arrayNodeRecharges);

			this.broadcast(json.toString());
		} catch (Throwable ex) {

		}
	}

	public void handleCollision() {

	}

}
