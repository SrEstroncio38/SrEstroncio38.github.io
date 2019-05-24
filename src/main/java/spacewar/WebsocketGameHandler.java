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
			//Mensaje que permite entrar a la sala pasada en "room", en caso de null entra en una default, GLOBAL
			case "JOIN ROOM":
				String roomname = node.path("room").asText();
				GameRoom room = game.rooms.get(roomname);
				if (room != null) {
					room.addPlayer(player);
					msg.put("event", "NEW ROOM");
					msg.put("room", roomname);
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				} else {
					msg.put("event", "NEW ROOM");
					msg.put("room", "GLOBAL");
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;
			//Mensaje para actualizar la posicion del jugador
			case "UPDATE MOVEMENT":
				GameRoom currentRoom = null;
				for (GameRoom croom : game.getRooms()) {
					if (croom.getPlayers().contains(player)) {
						currentRoom = croom;
						break;
					}
				}
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean() && player.getDeath() == false) {
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					currentRoom.addProjectile(projectile.getId(), projectile);
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
				game.addRoom(node.path("roomname").asText(),node.path("gamemode").asText());
				/*msg.put("event", "GO TO ROOM");
				msg.put("roomname", node.path("roomname").asText());
				player.getSession().sendMessage(new TextMessage(msg.toString()));*/
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
		game.removePlayer(player);

		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "REMOVE PLAYER");
		msg.put("id", player.getPlayerId());
		game.broadcast(msg.toString());
	}
}
