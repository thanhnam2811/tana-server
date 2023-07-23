import IController from '@interfaces/IController';
import registerHandler, { RegisterDto } from './handlers/register-handler';
import validatorMiddleware from '@middlewares/validatior-middleware';

const authController: IController = {
	register: [validatorMiddleware(RegisterDto), registerHandler],
};

export default authController;
