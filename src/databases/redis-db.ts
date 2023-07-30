import redisConfig from '@configs/redis-config';
import logUtil from '@utils/log-util';
import { createClient, RedisClientType } from 'redis';

export class RedisDB {
	// Singleton
	private static instance: RedisDB;
	public static getInstance(): RedisDB {
		if (!RedisDB.instance) {
			RedisDB.instance = new RedisDB();
		}

		return RedisDB.instance;
	}

	// Properties
	private client: RedisClientType;

	// Constructor
	private constructor() {
		const { HOST, PORT, PASS } = redisConfig;

		this.client = createClient({
			socket: {
				port: PORT,
				host: HOST,
			},
			password: PASS,
		});
	}

	// Methods
	public async connect() {
		await this.client.connect();

		logUtil.info('✅ RedisDB connected!');
	}

	public async disconnect() {
		await this.client.disconnect();

		logUtil.info('❌ RedisDB disconnected!');
	}

	public getClient() {
		return this.client;
	}
}

const redisDB = RedisDB.getInstance();
export default redisDB;

export const redisClient = redisDB.getClient();
