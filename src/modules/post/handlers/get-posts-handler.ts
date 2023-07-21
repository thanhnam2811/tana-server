import BaseHandler, { ReqMethod } from '@abstracts/base-handler';
import { RequestHandler } from 'express';

class GetPostHandler extends BaseHandler {
	public relativePath: string = '/';
	public method: ReqMethod = ReqMethod.GET;

	constructor() {
		super();

		// Register middlewares
		// this.addMiddleware()
	}

	protected _handler: RequestHandler = (req, res) => {
		console.log('Get post handler!');
		// throw new Error('Get post handler error!');
		res.send('Hello from post handler!');
	};
}

const getPostHandler = new GetPostHandler();
export default getPostHandler;
