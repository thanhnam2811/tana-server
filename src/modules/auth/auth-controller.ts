import IController from '@interfaces/controller-interface';
import registerHandler, { RegisterDto } from './handlers/register-handler';
import validatorMiddleware from '@middlewares/validatior-middleware';
import sendRegisterOtpHandler, { SendRegisterOtpDto } from './handlers/send-register-otp';

const authController: IController = {
	sendRegisterOtp: [validatorMiddleware(SendRegisterOtpDto), sendRegisterOtpHandler],

	register: [validatorMiddleware(RegisterDto), registerHandler],
};

export default authController;
