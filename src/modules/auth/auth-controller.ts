import IController from '@interfaces/controller-interface';
import registerHandler, { RegisterDto } from './handlers/register-handler';
import validatorMiddleware from '@middlewares/validatior-middleware';
import sendRegisterOtpHandler, { SendRegisterOtpDto } from './handlers/send-register-otp';
import loginHandler, { LoginDto } from './handlers/login-handler';
import refreshTokenHandler, { RefreshTokenDto } from './handlers/refresh-token-handler';

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

	login: {
		method: 'post',
		path: '/login',
		middlewares: [validatorMiddleware(LoginDto)],
		handler: async (req, res, next) => {
			try {
				const dto: RegisterDto = req.body;
				return await loginHandler(dto, res);
			} catch (error) {
				next(error);
			}
		},
	},

	refreshToken: {
		method: 'post',
		path: '/refresh-token',
		middlewares: [validatorMiddleware(RefreshTokenDto)],
		handler: async (req, res, next) => {
			try {
				const dto: RefreshTokenDto = req.body;
				return await refreshTokenHandler(dto, res);
			} catch (error) {
				next(error);
			}
		},
	},
};

export default authController;
