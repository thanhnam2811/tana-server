import loggerHelper from '@helpers/logger-helper';
import IController from '@interfaces/controller-interface';
import authController from '@modules/auth/auth-controller';
import { Application, Router } from 'express';

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
	private _routes: Map<string, IController> = new Map();

	// Constructor
	private constructor() {
		// Register routes
		this._registerRoute('/auth', authController);
	}

	// Methods
	private _registerRoute(path: string, controller: IController): void {
		if (this._routes.has(path)) {
			loggerHelper.warn(`Route ${path} already exists!`);
			return;
		}

		this._routes.set(path, controller);
	}

	public initRoutes(app: Application): void {
		for (const [path, route] of this._routes) {
			const router = this._createRouter(route);

			app.use(path, router);
		}
	}

	private _createRouter(controller: IController): Router {
		const router = Router();

		for (const key in controller) {
			const { method, path, middlewares, handler } = controller[key];

			router[method](path, ...middlewares, handler);
		}

		return router;
	}
}

const routerManager = RouterManager.instance;
export default routerManager;
