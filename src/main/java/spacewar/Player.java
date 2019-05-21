package spacewar;

import java.util.Random;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

public class Player extends Spaceship {

	private final WebSocketSession session;
	private final int playerId;
	private final String shipType;
	private String username;
	private float health;

	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.username = "Unknown";
		this.health = 100.0f;
		this.session = session;
		this.shipType = this.getRandomShipType();
	}

	public int getPlayerId() {
		return this.playerId;
	}

	public WebSocketSession getSession() {
		return this.session;
	}

	public void sendMessage(String msg) throws Exception {
		this.session.sendMessage(new TextMessage(msg));
	}

	public String getShipType() {
		return shipType;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getUsername() {
		return username;
	}
	
	public float getHealth() {
		return health;
	}
	
	public void addHealth(float health) {
		this.health += health;
		if (this.health < 0)
			this.health = 0.0f;
		if (this.health > 100)
			this.health = 100.0f;
	}

	private String getRandomShipType() {
		String[] randomShips = { "blue", "darkgrey", "green", "metalic", "orange", "purple", "red" };
		String ship = (randomShips[new Random().nextInt(randomShips.length)]);
		ship += "_0" + (new Random().nextInt(5) + 1) + ".png";
		return ship;
	}
	
	@Override
	public String toString() {
		return this.username;
	}
}
