package spacewar;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class GameRoom {

	ObjectMapper mapper = new ObjectMapper();
	private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
	
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>();
	private final int MAXPLAYERS;
	private final String roomName;
	private final String GameMode;
	private AtomicInteger numPlayers = new AtomicInteger();
	
	private Player roomCreator;
	private boolean isActive;

	public GameRoom(String roomName, String GameModeRef) {
		this.roomName = roomName;
		this.GameMode = GameModeRef;
		this.isActive = false;
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
	
	public String getRoomName() {
		return roomName;
	}
	
	public boolean isRoomActive() {
		return isActive;
	}
	
	public boolean isRoomOwner(Player player) {
		if (roomCreator.getPlayerId() == player.getPlayerId()) {
			return true;
		}
		return false;
	}

	public void addPlayer(Player player) {
		//Revisa que quepan los jugadores antes de agregarlo
		if(numPlayers.get() < MAXPLAYERS) {
			players.put(player.getSession().getId(), player);
			if (numPlayers.getAndIncrement() < 1) {
				roomCreator = player;
			}
		}
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "NUM PLAYERS IN ROOM");
		msg.put("numplayers", numPlayers.get());
		msg.put("maxplayers", MAXPLAYERS);
		msg.put("gamemode", GameMode);
		broadcast(msg.toString());
	}

	public Collection<Player> getPlayers() {
		return players.values();
	}

	public boolean removePlayer(Player player) {
		if (players.remove(player.getSession().getId()) != null) {

			int count = this.numPlayers.decrementAndGet();
			if (count == 0) {
				return true;
			}
			if (player.getPlayerId() == roomCreator.getPlayerId()) {
				return true;
			}
		}
		return false;
	}

	public void addProjectile(int id, Projectile projectile) {
		projectiles.put(id, projectile);
	}

	public Collection<Projectile> getProjectiles() {
		return projectiles.values();
	}

	public void removeProjectile(Projectile projectile) {
		players.remove(projectile.getId(), projectile);
	}

	public void startGameLoop() {
		this.isActive = true;
		scheduler = Executors.newScheduledThreadPool(1);
		scheduler.scheduleAtFixedRate(() -> tick(), SpacewarGame.TICK_DELAY, SpacewarGame.TICK_DELAY, TimeUnit.MILLISECONDS);
	}

	public void stopGameLoop() {
		if (scheduler != null) {
			scheduler.shutdown();
		}
	}

	public void broadcast(String message) {
		for (Player player : getPlayers()) {
			try {
				player.getSession().sendMessage(new TextMessage(message.toString()));
			} catch (Throwable ex) {
				/*
				System.err.println("Execption sending message to player " + player.getSession().getId());
				ex.printStackTrace(System.err);
				this.removePlayer(player);
				*/
			}
		}
	}

	private void tick() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodePlayers = mapper.createArrayNode();
		ArrayNode arrayNodeProjectiles = mapper.createArrayNode();

		long thisInstant = System.currentTimeMillis();
		Set<Integer> bullets2Remove = new HashSet<>();
		boolean removeBullets = false;

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

			json.put("event", "GAME STATE UPDATE");
			json.putPOJO("players", arrayNodePlayers);
			json.putPOJO("projectiles", arrayNodeProjectiles);

			this.broadcast(json.toString());
		} catch (Throwable ex) {

		}
	}

	public void handleCollision() {

	}

}
