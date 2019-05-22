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
	private int ammo;
	
	private boolean _dead;

	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.username = "Unknown";
		this.health = 100.0f;
		//Cambiar esta linea (hay que mandar el numero max de proyectiles)
		this.ammo = 8;
		this._dead = false;
		
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
	
	public void setDeath(boolean bool) {
		this._dead = bool;
	}
	
	public boolean getDeath() {
		return this._dead;
	}
	
	@Override
	public void loadMovement(boolean thrust, boolean brake, boolean rotLeft, boolean rotRight) {
		if (_dead == false) {
			super.loadMovement(thrust, brake, rotLeft, rotRight);
		}
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

	public int getAmmo() {
		return ammo;
	}

	public void setAmmo(int ammo) {
		this.ammo = ammo;
	}
}
