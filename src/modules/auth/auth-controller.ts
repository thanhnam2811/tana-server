import IController from '@interfaces/controller-interface';
import registerHandler, { RegisterDto } from './handlers/register-handler';
import validatorMiddleware from '@middlewares/validatior-middleware';
import sendRegisterOtpHandler, { SendRegisterOtpDto } from './handlers/send-register-otp';

const authController: IController = {
	sendRegisterOtp: {
		method: 'post',
		path: '/send-register-otp',
		middlewares: [validatorMiddleware(SendRegisterOtpDto)],
		handler: async (req, res, next) => {
			try {
				const dto: SendRegisterOtpDto = req.body;
				return await sendRegisterOtpHandler(dto, res);
			} catch (error) {
				next(error);
			}
		},
	},

	register: {
		method: 'post',
		path: '/register',
		middlewares: [validatorMiddleware(RegisterDto)],
		handler: async (req, res, next) => {
			try {
				const dto: RegisterDto = req.body;
				return await registerHandler(dto, res);
			} catch (error) {
				next(error);
			}
		},
	},
};

export default authController;
