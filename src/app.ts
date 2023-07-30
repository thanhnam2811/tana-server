import appConfig, { EnvEnum } from '@configs/app-config';
import logUtil from '@utils/log-util';
import express, { Application } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import routerManager from '@managers/router-manager';
import errorHandlerMiddleware from '@middlewares/error-handler-middleware';
import loggerMiddleware from '@middlewares/logger-middleware';
import mongoDB from '@databases/mongo-db';
import redisDB from '@databases/redis-db';
import http from 'http';
import socketManager from '@managers/socket-manager';
import { StatusCodes } from 'http-status-codes';

export class App {
	// Singleton
	private static instance: App;
	public static getInstance(): App {
		if (!App.instance) {
			App.instance = new App();
		}
		return App.instance;
	}

	// Properties
	private PORT: number;
	private ENV: EnvEnum;
	private app: Application;
	private server: http.Server;

	// Constructor
	private constructor() {
		this.PORT = appConfig.PORT;
		this.ENV = appConfig.ENV;
		this.app = express();
		this.server = http.createServer(this.app);
	}

	// Methods
	public async start(): Promise<void> {
		logUtil.info('⏳ Starting server...');

		logUtil.line();

		await this.init();

		logUtil.line();

		this.server.listen(this.PORT, () => {
			logUtil.info(`🌐 Environment: ${this.ENV}`);
			logUtil.info(`🚀 Server started on port ${this.PORT}!`);
			logUtil.line();
		});
	}

	private async init() {
		this.initExpress();
		this.initMiddlewares();
		this.initRoutes();
		this.initErrorHandlers();
		await this.initDatabase();
		this.initSocket();
	}

	private initExpress(): void {
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));

		this.app.use(compression());
		this.app.use(helmet());
		this.app.use(cors({ origin: '*' }));

		logUtil.info('✅ Express initialized!');
	}

	private initMiddlewares(): void {
		this.app.use(loggerMiddleware);

		logUtil.info('✅ Middlewares initialized!');
	}

	private initRoutes(): void {
		this.app.get('/', (req, res) => {
			res.status(StatusCodes.OK).json({ message: 'Hello world! From TANA with love!' });
		});

		routerManager.initRoutes(this.app);

		logUtil.info('✅ Routes initialized!');
	}

	private initErrorHandlers(): void {
		this.app.use(errorHandlerMiddleware);

		logUtil.info('✅ Error handlers initialized!');
	}

	private async initDatabase(): Promise<void> {
		await mongoDB.connect();
		await redisDB.connect();

		logUtil.info('✅ Database initialized!');
	}

	private initSocket(): void {
		socketManager.start(this.server);

		logUtil.info('✅ Socket initialized!');
	}

	// Getters
	public getPORT(): number {
		return this.PORT;
	}
}

const app = App.getInstance();
export default app;
