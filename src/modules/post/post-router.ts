import BaseController from '@abstracts/base-controller';
import BaseRouter from '@abstracts/base-router';
import { PostController } from './post-controller';

export class PostRouter extends BaseRouter {
	public controller: BaseController;
	public path: string = '/post';

	constructor() {
		super();

		// Create controller
		this.controller = new PostController();

		// Register middlewares
		// this.addMiddleware()
	}

	public initRoutes(): void {
		this.controller.initHandlers(this.router);
	}
}

const postRouter = new PostRouter();
export default postRouter;
