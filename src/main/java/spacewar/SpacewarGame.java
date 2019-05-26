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
	//Instancia
	public final static SpacewarGame INSTANCE = new SpacewarGame();
	
	//Variables generales
	public final static int FPS = 30;
	public final static long TICK_DELAY = 1000 / FPS;
	public final static boolean DEBUG_MODE = true;
	public final static boolean VERBOSE_MODE = true;

	ObjectMapper mapper = new ObjectMapper();
	
	//Variables de jugadores
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private AtomicInteger numPlayers = new AtomicInteger();
	
	//Variables de salas
	private AtomicInteger numRooms = new AtomicInteger();
	public Map<String,GameRoom> rooms = new ConcurrentHashMap<>();
	
	//Variables de jugadores DENTRO de salas
	private Map<String, Player> playingPlayers = new ConcurrentHashMap<>();
	private AtomicInteger numPlayingPlayers = new AtomicInteger();
	private Lock playingPlayersLock = new ReentrantLock();
	
	private SpacewarGame() {
		this.numRooms.getAndSet(-1);
	}
	
	/********************************
	 * 		FUNCIONES DE ROOM		*
	 ********************************/
	
	//Elimina una sala y manda lista de salas a TODOS los jugadores
	public void removeRoom(String name) {
		if(rooms.remove(name) != null) {
			numRooms.getAndDecrement();
			notifyRoomList();
		}
	}
	
	//Añade una sala y manda lista de salas a TODOS los jugadores
	public boolean addRoom(String name, String gameMode) {
		if(rooms.putIfAbsent(name, new GameRoom(name, gameMode)) == null) {
			numRooms.getAndIncrement();
			notifyRoomList();
			return true;
		}
		return false;
		
	}
	
	//Devuelve una sala concreta
	public GameRoom getRoom(String key) {
		return rooms.get(key);
	}
	
	//Devuelve todas las rooms
	public Collection<GameRoom> getRooms() {
		return rooms.values();
	}
	
	//Devuelve las salas que no esten activas
	public Collection<GameRoom> getUnstartedRooms() {
		Collection<GameRoom> unstartedRooms = new HashSet<>();
		for (GameRoom room : getRooms()) {
			if (!room.isRoomActive())
				unstartedRooms.add(room);
		}
		return unstartedRooms;
	}
	
	/********************************
	 * 		NOTIFICACIONES ROOM		*
	 ********************************/
	
	/*
	 * Manda un Broadcas a TODOS los players de las salas que hay
	 * junto su nombre, los jugadores en la sala y los máximos
	 */
	public void notifyRoomList() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodeRooms = mapper.createArrayNode();
		
		int index = 0;
		
		try {
			for (GameRoom room : getUnstartedRooms()) {
				ObjectNode jsonRoom = mapper.createObjectNode();
				jsonRoom.put("index", index);
				jsonRoom.put("name", room.getRoomName());
				jsonRoom.put("maxplayers", room.getMaxPlayers());
				jsonRoom.put("currentplayers", room.getNumPlayers());
				arrayNodeRooms.addPOJO(jsonRoom);
				index++;
			}
			json.put("event", "UPDATE ROOM LIST");
			json.putPOJO("rooms", arrayNodeRooms);

			this.broadcast(json.toString());
		} catch (Throwable ex) {

		}
	}
	
	/*
	 * Manda un mensaje al player pasa como argumento de las salas que hay
	 * junto su nombre, los jugadores en la sala y los máximos
	 */
	public void notifyRoomList(Player msgPlayer) {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodeRooms = mapper.createArrayNode();
		
		int index = 0;
		
		try {
			for (GameRoom room : getUnstartedRooms()) {
				ObjectNode jsonRoom = mapper.createObjectNode();
				jsonRoom.put("index", index);
				jsonRoom.put("name", room.getRoomName());
				jsonRoom.put("maxplayers", room.getMaxPlayers());
				jsonRoom.put("currentplayers", room.getNumPlayers());
				arrayNodeRooms.addPOJO(jsonRoom);
				index++;
			}
			json.put("event", "UPDATE ROOM LIST");
			json.putPOJO("rooms", arrayNodeRooms);

			msgPlayer.getSession().sendMessage(new TextMessage(json.toString()));
		} catch (Throwable ex) {

		}
	}

	/********************************
	 * 		FUNCIONES PLAYER		*
	 ********************************/
	
	//Añade un jugador al juego y lo contabiliza
	public void addPlayer(Player player) {
		players.put(player.getSession().getId(), player);

		numPlayers.getAndIncrement();
	}
	
	//Devuelve los players del juego
	public Collection<Player> getPlayers() {
		return players.values();
	}
	
	//Elimina un player asegurandose que también lo hace de una sala si es necesario
	public void removePlayer(Player player) {
		players.remove(player.getSession().getId());
		removePlayingPlayer(player);
		
		for (GameRoom room : getRooms()) {
			room.removePlayer(player);
		}

		this.numPlayers.decrementAndGet();
	}
	
	/********************************
	 * 	FUNCIONES PLAYER EN SALA	*
	 ********************************/
	
	/*
	 * Añade un player a la lista de jugadores dentro de alguna sala
	 */
	public void addPlayingPlayer(Player player) {
		playingPlayersLock.lock();
		playingPlayers.put(player.getSession().getId(), player);
		numPlayingPlayers.getAndIncrement();
		notifyPlayingPlayers();
	}
	
	/*
	 * Elimina un player de la lista de jugadores dentro de alguna sala
	 */
	public void removePlayingPlayer(Player player) {
		playingPlayersLock.lock();
		playingPlayers.remove(player.getSession().getId());
		this.numPlayingPlayers.decrementAndGet();
		notifyPlayingPlayers();
	}
	
	//Devuelve los jugadores que se encuentren en alguna sala
	public Collection<Player> getPlayingPlayers() {
		return playingPlayers.values();
	}
	
	/********************************
	 * NOTIFICACIONES PLAYER EN SALA*
	 ********************************/
	
	/*
	 * Realiza un broadcast a TODOS los jugadores del juego, enviando
	 * el id y el nombre de los jugadores que estén en alguna sala
	 */
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
	/*
	 * Manda un mensaje al player pasado por argumento los jugadores del juego, 
	 * enviando el id y el nombre de los jugadores que estén en alguna sala
	 */
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

	
	/********************************
	 * 			BROADCAST			*
	 ********************************/
	
	//Manda un mensaje a TODOS los jugadores del juego
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

	// ???
	public void handleCollision() {

	}
}
