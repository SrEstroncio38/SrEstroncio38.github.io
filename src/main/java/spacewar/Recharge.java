package spacewar;

public class Recharge extends SpaceObject{
	private final int id;
	private static final int LIFESPAN = 4000;
	private final long spawnInstant;
	private boolean isHit = false;
	
	public Recharge(int id) {
		this.id = id % 300; // 300 = maxRecharges
		this.spawnInstant = System.currentTimeMillis();
	}

	public long getSpawnInstant() {
		return spawnInstant;
	}

	public static int getLifespan() {
		return LIFESPAN;
	}

	public int getId() {
		return id;
	}
	
	public boolean isAlive(long thisInstant) {
		return (thisInstant < (this.spawnInstant + LIFESPAN));
	}

	public boolean isHit() {
		return isHit;
	}

	public void setHit(boolean isHit) {
		this.isHit = isHit;
	}
}
