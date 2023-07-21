import BaseController from '@abstracts/base-controller';
import getPostsHandler from './handlers/get-posts-handler';

export class PostController extends BaseController {
	constructor() {
		super();

		this._registerHandler(getPostsHandler);
	}
}

