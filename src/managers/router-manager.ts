import logUtil from '@utils/log-util';
import IController from '@interfaces/controller-interface';
import authController from '@modules/auth/auth-controller';
import { Application, Router } from 'express';

export class RouterManager {
	// Singleton
	private static instance: RouterManager;
	public static getInstance(): RouterManager {
		if (!RouterManager.instance) {
			RouterManager.instance = new RouterManager();
		}

		return RouterManager.instance;
	}

	// Properties
	private routes: Map<string, IController> = new Map();

	// Constructor
	private constructor() {
		// Register routes
		this.registerRoute('/auth', authController);
	}

	// Methods
	private registerRoute(path: string, controller: IController): void {
		if (this.routes.has(path)) {
			logUtil.warn(`Route ${path} already exists!`);
			return;
		}

		this.routes.set(path, controller);
	}

	public initRoutes(app: Application): void {
		for (const [path, route] of this.routes) {
			const router = this.createRouter(route);

			app.use(path, router);
		}
	}

	private createRouter(controller: IController): Router {
		const router = Router();

		for (const key in controller) {
			const { method, path, middlewares, handler } = controller[key];

			router[method](path, ...middlewares, handler);
		}

		return router;
	}
}

const routerManager = RouterManager.getInstance();
export default routerManager;
