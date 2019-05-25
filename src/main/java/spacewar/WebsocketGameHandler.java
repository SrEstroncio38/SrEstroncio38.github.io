package spacewar;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class WebsocketGameHandler extends TextWebSocketHandler {

	private SpacewarGame game = SpacewarGame.INSTANCE;
	private static final String PLAYER_ATTRIBUTE = "PLAYER";
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);
	
	private Lock sessionLock = new ReentrantLock();
	private Lock chatLock = new ReentrantLock();
	private Lock roomChatLock = new ReentrantLock();
	private Lock roomListLock = new ReentrantLock();
	private Lock leaveRoomLock = new ReentrantLock();

	@Override
	public void afterConnectionEstablished(WebSocketSession unprotectedSession) throws Exception {
		sessionLock.lock();
		WebSocketSession session = unprotectedSession;
		sessionLock.unlock();
		Player player = new Player(playerId.incrementAndGet(), session);
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);
		
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		msg.put("username", player.getUsername());
		msg.put("ammo", player.getAmmo());
		msg.put("thrust", player.getThrust());
		msg.put("roomname", player.getRoomname());
		player.getSession().sendMessage(new TextMessage(msg.toString()));
		
		game.addPlayer(player);
		roomListLock.lock();
		game.notifyRoomList(player);
		roomListLock.unlock();
	}

	@Override
	protected void handleTextMessage(WebSocketSession unprotectedSession, TextMessage message) throws Exception {
		sessionLock.lock();
		WebSocketSession session = unprotectedSession;
		sessionLock.unlock();
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
			
			GameRoom room = null;
			String roomname;

			switch (node.get("event").asText()) {
			//Mensaje que se activa cuando se entra en la aplicacion
			case "JOIN":
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				msg.put("username", player.getUsername());
				msg.put("ammo", player.getAmmo());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "ASK PLAYING PLAYERS":
				game.notifyPlayingPlayers(player);
				break;
			//Mensaje que permite entrar a la sala pasada en "room", en caso de null entra en una default, GLOBAL
			case "JOIN ROOM":
				roomname = node.path("room").asText();
				room = game.rooms.get(roomname);
				if (room != null) {
					room.addPlayer(player);
					game.addPlayingPlayer(player);
					msg.put("event", "NEW ROOM");
					msg.put("room", roomname);
					msg.put("boss", room.isRoomOwner(player));
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				} else {
					msg.put("event", "NEW ROOM");
					msg.put("room", "GLOBAL");
					msg.put("boss", false);
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;
			case "LEAVE ROOM":
				roomname = node.path("room").asText();
				leaveRoomLock.lock();
				room = game.rooms.get(roomname);
				if (room == null) break;
				game.removePlayingPlayer(player);
				if (room.removePlayer(player)) {
					for (Player cplayer : room.getPlayers()) {
						game.removePlayingPlayer(cplayer);
						msg.put("event", "FORCE LEAVING ROOM");
						cplayer.getSession().sendMessage(new TextMessage(msg.toString()));
					}
					roomListLock.lock();
					game.removeRoom(roomname);
					roomListLock.unlock();
				}
				leaveRoomLock.unlock();
				break;
			//Mensaje para actualizar la posicion del jugador
			case "UPDATE MOVEMENT":
				room = null;
				for (GameRoom croom : game.getRooms()) {
					if (croom.getPlayers().contains(player)) {
						room = croom;
						break;
					}
				}
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean() && player.getDeath() == false) {
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					room.addProjectile(projectile.getId(), projectile);
					player.setAmmo(node.path("ammo").asInt());
				}
				break;
			//Mensaje que actualiza el nombre del jugador al escogido	
			case "UPDATE NAME":
				player.setUsername(node.path("username").asText());
				for (Player currentplayer : game.getPlayers()) {
					if (currentplayer.getPlayerId() == player.getPlayerId()) {
						currentplayer.setUsername(node.path("username").asText());
					}
				}
				break;
			//Mensaje que se llama cuando se crea una nueva sala para recibir su nombre
			case "CREATE ROOM":
				roomListLock.lock();
				game.addRoom(node.path("roomname").asText(),node.path("gamemode").asText());
				roomListLock.unlock();
				/*msg.put("event", "GO TO ROOM");
				msg.put("roomname", node.path("roomname").asText());
				player.getSession().sendMessage(new TextMessage(msg.toString()));*/
				break;
			case "START GAME":
				roomname = node.path("room").asText();
				leaveRoomLock.lock();
				room = game.rooms.get(roomname);
				if (room.getPlayers().size() > 1) {
					room.startGameLoop();
					roomListLock.lock();
					game.notifyRoomList();
					roomListLock.unlock();
					msg.put("event", "SEND TO GAME");
					room.broadcast(msg.toString());
				}
				leaveRoomLock.unlock();
				break;
			//Mensaje que imprime una cadena de texto nueva en el chat global (a todo el mundo conectado)
			case "POST GLOBAL CHAT":
				chatLock.lock();
				msg.put("event", "PRINT GLOBAL CHAT");
				msg.put("username", node.path("username").asText());
				msg.put("text", node.path("text").asText());
				game.broadcast(msg.toString());
				chatLock.unlock();
				break;
			//Mensaje que imprime una cadena de texto nueva en el chat local (a todo el mundo en tu partida)
			case "POST ROOM CHAT":
				roomChatLock.lock();
				room = null;
				for (GameRoom croom : game.getRooms()) {
					if (croom.getPlayers().contains(player)) {
						room = croom;
						break;
					}
				}
				if (room != null) {
					msg.put("event", "PRINT ROOM CHAT");
					msg.put("username", node.path("username").asText());
					msg.put("text", node.path("text").asText());
					room.broadcast(msg.toString());
				}
				roomChatLock.unlock();
				break;
			default:
				break;
			}

		} catch (Exception e) {
			System.err.println("Exception processing message " + message.getPayload());
			e.printStackTrace(System.err);
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession unprotectedSession, CloseStatus status) throws Exception {
		sessionLock.lock();
		WebSocketSession session = unprotectedSession;
		sessionLock.unlock();
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);

		ObjectNode msg = mapper.createObjectNode();
		
		// Delete room (in case he was in one)
		GameRoom room = null;
		for (GameRoom croom : game.getRooms()) {
			if (croom.getPlayers().contains(player)) {
				room = croom;
				break;
			}
		}
		game.removePlayer(player);
		if (room != null) {
			game.removePlayingPlayer(player);
			if (room.removePlayer(player)) {
				for (Player cplayer : room.getPlayers()) {
					game.removePlayingPlayer(cplayer);
					msg.put("event", "FORCE LEAVING ROOM");
					cplayer.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				roomListLock.lock();
				game.removeRoom(room.getRoomName());
				roomListLock.unlock();
			}
		}
		
		// Notify the missing player
		msg.put("event", "REMOVE PLAYER");
		msg.put("id", player.getPlayerId());
		game.broadcast(msg.toString());
	}
}
