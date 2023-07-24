import appConfig, { EnvEnum } from '@configs/app-config';
import loggerHelper from '@helpers/logger-helper';
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

export class App {
	// Singleton
	private static _instance: App;
	public static get instance(): App {
		if (!App._instance) {
			App._instance = new App();
		}
		return App._instance;
	}

	// Properties
	private _PORT: number;
	private _ENV: EnvEnum;
	private _app: Application;
	private _server: http.Server;

	// Constructor
	private constructor() {
		this._PORT = appConfig.PORT;
		this._ENV = appConfig.ENV;
		this._app = express();
		this._server = http.createServer(this._app);
	}

	// Methods
	public async start(): Promise<void> {
		const line = ''.padStart(50, '=');

		loggerHelper.info('⏳ Starting server...');

		loggerHelper.info(line);

		this._init();

		loggerHelper.info(line);

		this._server.listen(this._PORT, () => {
			loggerHelper.info(`🌐 Environment: ${this._ENV}`);
			loggerHelper.info(`🚀 Server started on port ${this._PORT}!`);
			loggerHelper.info(line);
		});

		loggerHelper.info(line);
	}

	private async _init() {
		this._initExpress();
		this._initMiddlewares();
		this._initRoutes();
		this._initErrorHandlers();
		await this._initDatabase();
		this._initSocket();
	}

	private _initExpress(): void {
		this._app.use(express.json());
		this._app.use(express.urlencoded({ extended: true }));

		this._app.use(compression());
		this._app.use(helmet());
		this._app.use(cors({ origin: '*' }));

		loggerHelper.info('✅ Express initialized!');
	}

	private _initMiddlewares(): void {
		this._app.use(loggerMiddleware);

		loggerHelper.info('✅ Middlewares initialized!');
	}

	private _initRoutes(): void {
		this._app.get('/', (req, res) => {
			res.send('Hello world! From TANA with love!');
		});

		routerManager.initRoutes(this._app);

		loggerHelper.info('✅ Routes initialized!');
	}

	private _initErrorHandlers(): void {
		this._app.use(errorHandlerMiddleware);

		loggerHelper.info('✅ Error handlers initialized!');
	}

	private async _initDatabase(): Promise<void> {
		await mongoDB.connect();
		await redisDB.connect();

		loggerHelper.info('✅ Database initialized!');
	}

	private _initSocket(): void {
		socketManager.start(this._server);

		loggerHelper.info('✅ Socket initialized!');
	}

	// Getters
	public get PORT(): number {
		return this._PORT;
	}
}

const app = App.instance;
export default app;
