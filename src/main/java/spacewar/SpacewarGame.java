package spacewar;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;

public class SpacewarGame {

	public final static SpacewarGame INSTANCE = new SpacewarGame();

	public final static int FPS = 30;
	public final static long TICK_DELAY = 1000 / FPS;
	public final static boolean DEBUG_MODE = true;
	public final static boolean VERBOSE_MODE = true;

	ObjectMapper mapper = new ObjectMapper();

	// GLOBAL GAME ROOM
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private AtomicInteger numPlayers = new AtomicInteger();
	private AtomicInteger numRooms = new AtomicInteger();
	public Map<String,GameRoom> rooms = new ConcurrentHashMap<>();
	
	// Chat
	private Lock chatLock = new ReentrantLock();
	private String chat = "";
	
	private SpacewarGame() {
		this.numRooms.getAndSet(-1);
		/*rooms.put("Sala 1", new GameRoom());
		rooms.put("Sala 2", new GameRoom());*/

	}
	
	public void addChatEntry(String username, String text) {
		chatLock.lock();
		chat += "[" + username + "]: " + text + "\n";
		chatLock.unlock();
	}
	
	public String getChatText() {
		return chat;
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
		
		for (GameRoom room : getRooms()) {
			room.removePlayer(player);
		}

		this.numPlayers.decrementAndGet();
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
