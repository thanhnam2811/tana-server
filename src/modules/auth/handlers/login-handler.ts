import { HttpException } from '@exceptions/http-exception';
import { IHandler } from '@interfaces/controller-interface';
import IUser from '@modules/user/user-interface';
import UserModel from '@modules/user/user-model';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import passwordHelper from '../helpers/password-helper';
import { TokenHelper } from '../helpers/token-helper';

export class LoginDto {
	@IsNotEmpty({ message: 'Email không được để trống!' })
	@IsEmail({}, { message: 'Email không hợp lệ!' })
	email: string;

	@IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
	@IsString({ message: 'Mật khẩu không hợp lệ!' })
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{ message: 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt!' },
	)
	password: string;
}

const loginHandler: IHandler<LoginDto> = async (dto, res) => {
	// Check if email is already registered
	const user = await UserModel.findByEmail(dto.email);
	if (!user) {
		throw new HttpException(StatusCodes.NOT_FOUND, 'Tài khoản không tồn tại!');
	}

	// Check lock
	await checkLock(user);

	// Check password
	await checkPassword(user, dto.password);

	// Reset user
	resetUser(user);

	// Token
	const tokenHelper = new TokenHelper(user);

	const { accessToken, refreshToken } = tokenHelper.getToken();

	// Response
	res.status(StatusCodes.OK).json({
		message: 'Đăng nhập thành công!',
		accessToken,
		refreshToken,
	});
};

const checkLock = async (user: IUser) => {
	if (!user.isLocked) return; // Skip if user is not locked

	const lockReason = user.lockReason || 'Lý do không rõ!';

	// Check if lock forever
	if (!user.lockUntil) {
		throw new HttpException(StatusCodes.LOCKED, `Tài khoản đã bị khóa vĩnh viễn! Lý do: ${lockReason}`);
	}

	// Check if lock time is over
	if (user.lockUntil.getTime() > Date.now()) {
		const timeLeft = DateTime.fromJSDate(user.lockUntil).toRelative();

		throw new HttpException(StatusCodes.LOCKED, `Tài khoản đã bị khóa đến ${timeLeft}! Lý do: ${lockReason}`);
	}
};

const checkPassword = async (user: IUser, password: string) => {
	const isMatch = await passwordHelper.compare(password, user.password);
	if (isMatch) return; // Skip if password is correct

	// Update login attempts
	user.loginAttempts++;

	// Check if login attempts is 5
	if (user.loginAttempts === 5) {
		// Lock user
		user.isLocked = true;
		user.lockReason = 'Đăng nhập sai quá 5 lần!';
		user.lockUntil = DateTime.local().plus({ minutes: 15 }).toJSDate();

		// Save user (later)
		UserModel.findByIdAndUpdate(user._id, user).exec();

		throw new HttpException(StatusCodes.LOCKED, 'Tài khoản đã bị khóa 15 phút! Lý do: Đăng nhập sai quá 5 lần!');
	}

	// Check if login attempts is over 10
	if (user.loginAttempts >= 10) {
		// Lock user
		user.isLocked = true;
		user.lockReason = 'Đăng nhập sai quá 10 lần!';

		// Save user (later)
		UserModel.findByIdAndUpdate(user._id, user).exec();

		throw new HttpException(StatusCodes.LOCKED, 'Tài khoản đã bị khóa vĩnh viễn! Lý do: Đăng nhập sai quá 10 lần!');
	}

	// Save user (later)
	UserModel.findByIdAndUpdate(user._id, user).exec();
	throw new HttpException(StatusCodes.UNAUTHORIZED, 'Mật khẩu không chính xác!');
};

const resetUser = (user: IUser) => {
	// Reset login attempts
	user.loginAttempts = 0;

	// Reset lock
	user.isLocked = false;
	user.lockReason = null;
	user.lockUntil = null;

	// Save user (later)
	UserModel.findByIdAndUpdate(user._id, user).exec();
};

export default loginHandler;
