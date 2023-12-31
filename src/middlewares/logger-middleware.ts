import { createLogger } from '@utils/log-util';
import morgan from 'morgan';

const logger = createLogger('http');

const loggerMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', {
	stream: {
		write: (message) => logger.http(message.trim()),
	},
});

export default loggerMiddleware;
