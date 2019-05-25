package spacewar;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

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
	private Lock roomsLock = new ReentrantLock();
	
	private Map<String, Player> playingPlayers = new ConcurrentHashMap<>();
	private AtomicInteger numPlayingPlayers = new AtomicInteger();
	private Lock playingPlayersLock = new ReentrantLock();
	
	private SpacewarGame() {
		this.numRooms.getAndSet(-1);
		/*rooms.put("Sala 1", new GameRoom());
		rooms.put("Sala 2", new GameRoom());*/

	}
	
	public void removeRoom(String name) {
		roomsLock.lock();
		if(rooms.remove(name) != null) {
			numRooms.getAndDecrement();
			notifyRoomList();
		} else {
			roomsLock.unlock();
		}
	}
	
	public void addRoom(String name, String gameMode) {
		roomsLock.lock();
		if(rooms.putIfAbsent(name, new GameRoom(name, gameMode)) == null) {
			numRooms.getAndIncrement();
			notifyRoomList();
		} else {
			roomsLock.unlock();
		}
		
	}
	
	public Collection<GameRoom> getRooms() {
		return rooms.values();
	}
	
	public Collection<GameRoom> getUnstartedRooms() {
		Collection<GameRoom> unstartedRooms = new HashSet<>();
		for (GameRoom room : getRooms()) {
			if (!room.isRoomActive())
				unstartedRooms.add(room);
		}
		return unstartedRooms;
	}
	
	public void notifyRoomList() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodeRooms = mapper.createArrayNode();
		
		try {
			for (GameRoom room : getUnstartedRooms()) {
				ObjectNode jsonRoom = mapper.createObjectNode();
				jsonRoom.put("name", room.getRoomName());
				arrayNodeRooms.addPOJO(jsonRoom);
			}
			json.put("event", "UPDATE ROOM LIST");
			json.putPOJO("rooms", arrayNodeRooms);

			this.broadcast(json.toString());
		} catch (Throwable ex) {

		}
		roomsLock.unlock();
	}
	
	public void notifyRoomList(Player msgPlayer) {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodeRooms = mapper.createArrayNode();
		
		roomsLock.lock();
		try {
			for (GameRoom room : getUnstartedRooms()) {
				ObjectNode jsonRoom = mapper.createObjectNode();
				jsonRoom.put("name", room.getRoomName());
				arrayNodeRooms.addPOJO(jsonRoom);
			}
			json.put("event", "UPDATE ROOM LIST");
			json.putPOJO("rooms", arrayNodeRooms);

			msgPlayer.getSession().sendMessage(new TextMessage(json.toString()));
		} catch (Throwable ex) {

		}
		roomsLock.unlock();
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
		playingPlayersLock.lock();
		playingPlayers.put(player.getSession().getId(), player);
		numPlayingPlayers.getAndIncrement();
		notifyPlayingPlayers();
	}

	public void removePlayingPlayer(Player player) {
		playingPlayersLock.lock();
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
		playingPlayersLock.unlock();
	}
	
	public void notifyPlayingPlayers(Player msgPlayer) {
		playingPlayersLock.lock();
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

			msgPlayer.getSession().sendMessage(new TextMessage(json.toString()));
		} catch (Throwable ex) {

		}
		playingPlayersLock.unlock();
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
