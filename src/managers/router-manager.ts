import loggerHelper from '@helpers/logger-helper';
import authRouter from '@modules/auth/auth-router';
import { Application, RequestHandler, Router } from 'express';

type Route = {
	router: Router;
	middlewares: RequestHandler[];
};

export class RouterManager {
	// Singleton
	private static _instance: RouterManager;
	public static get instance(): RouterManager {
		if (!RouterManager._instance) {
			RouterManager._instance = new RouterManager();
		}

		return RouterManager._instance;
	}

	// Properties
	private _routes: Map<string, Route> = new Map();

	// Constructor
	private constructor() {
		// Register routes
		this._registerRoute('/auth', authRouter);
	}

	// Methods
	private _registerRoute(path: string, router: Router, middlewares: RequestHandler[] = []): void {
		if (this._routes.has(path)) {
			loggerHelper.warn(`Route ${path} already exists!`);
			return;
		}

		this._routes.set(path, { router, middlewares });
	}

	public initRoutes(app: Application): void {
		for (const [path, route] of this._routes) {
			const { router, middlewares } = route;

			app.use(path, ...middlewares, router);
		}
	}
}

const routerManager = RouterManager.instance;
export default routerManager;
