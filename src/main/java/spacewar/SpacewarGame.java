package spacewar;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class SpacewarGame {

	public final static SpacewarGame INSTANCE = new SpacewarGame();

	public final static int FPS = 30;
	public final static long TICK_DELAY = 1000 / FPS;
	public final static boolean DEBUG_MODE = true;
	public final static boolean VERBOSE_MODE = true;

	ObjectMapper mapper = new ObjectMapper();

	private Map<String, Player> players = new ConcurrentHashMap<>();
	private AtomicInteger numPlayers = new AtomicInteger();
	
	private AtomicInteger numRooms = new AtomicInteger();
	public Map<String,GameRoom> rooms = new ConcurrentHashMap<>();
	
	private Map<String, Player> playingPlayers = new ConcurrentHashMap<>();
	private AtomicInteger numPlayingPlayers = new AtomicInteger();
	
	private SpacewarGame() {
		this.numRooms.getAndSet(-1);
		/*rooms.put("Sala 1", new GameRoom());
		rooms.put("Sala 2", new GameRoom());*/

	}
	
	public void removeRoom(String name) {
		if(rooms.remove(name) != null) {
			numRooms.getAndDecrement();
		}
	}
	
	public void addRoom(String name, String gameMode) {
		if(rooms.putIfAbsent(name, new GameRoom(gameMode)) == null) {
			numRooms.getAndIncrement();
		} 
		
	}
	
	public Collection<GameRoom> getRooms() {
		return rooms.values();
	}

	public void addPlayer(Player player) {
		players.put(player.getSession().getId(), player);

		numPlayers.getAndIncrement();
	}

	public Collection<Player> getPlayers() {
		return players.values();
	}

	public void removePlayer(Player player) {
		players.remove(player.getSession().getId());
		removePlayingPlayer(player);
		
		for (GameRoom room : getRooms()) {
			room.removePlayer(player);
		}

		this.numPlayers.decrementAndGet();
	}
	
	public void addPlayingPlayer(Player player) {
		playingPlayers.put(player.getSession().getId(), player);
		numPlayingPlayers.getAndIncrement();
		notifyPlayingPlayers();
	}

	public void removePlayingPlayer(Player player) {
		playingPlayers.remove(player.getSession().getId());
		this.numPlayingPlayers.decrementAndGet();
		notifyPlayingPlayers();
	}

	public Collection<Player> getPlayingPlayers() {
		return playingPlayers.values();
	}
	
	public void notifyPlayingPlayers() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodePlayers = mapper.createArrayNode();
		
		try {
			for (Player player : getPlayingPlayers()) {
				ObjectNode jsonPlayer = mapper.createObjectNode();
				jsonPlayer.put("id", player.getPlayerId());
				jsonPlayer.put("username", player.getUsername());
				arrayNodePlayers.addPOJO(jsonPlayer);
			}
			json.put("event", "UPDATE PLAYING PLAYERS");
			json.putPOJO("players", arrayNodePlayers);

			this.broadcast(json.toString());
		} catch (Throwable ex) {

		}
	}

	public void broadcast(String message) {
		for (Player player : getPlayers()) {
			try {
				player.getSession().sendMessage(new TextMessage(message.toString()));
			} catch (Throwable ex) {
				System.err.println("Execption sending message to player " + player.getSession().getId());
				ex.printStackTrace(System.err);
				this.removePlayer(player);
			}
		}
	}

	// ???
	public void handleCollision() {

	}
}
