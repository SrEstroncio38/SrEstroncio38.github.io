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
	private int points;
	private int thrust;
	private String roomname;
	
	private boolean _dead;

	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.username = "Unknown";
		this.health = 100.0f;
		// TODO Cambiar esta linea (hay que mandar el numero max de proyectiles)
		this.ammo = 50;
		this.thrust = 100;
		this._dead = false;
		this.points = 0;
		this.roomname = "";
		this.session = session;
		this.shipType = this.getRandomShipType();
	}
	
	public void setRoomname(String roomname) {
		this.roomname = roomname;
	}
	
	public String getRoomname() {
		return this.roomname;
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
			if (thrust && this.thrust>0) {
				this.thrust--;				
			}
			else if (!thrust && this.thrust<100)
				this.thrust++;
			System.out.println("THRUST ACTUAL: " + this.thrust);
			if (thrust && this.thrust<=0) {
				thrust = false;
				brake = true;
			}
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
	
	public void addAmmo(int ammo) {
		this.ammo += ammo;
	}
	
	public int getPoints() {
		return this.points;
	}
	
	public void addPoints(int point) {
		this.points += point;
	}
	
	public void setPoints(int point) {
		this.points = point;
	}

	public int getThrust() {
		return thrust;
	}

	public void setThrust(int thrust) {
		this.thrust = thrust;
	}
}
