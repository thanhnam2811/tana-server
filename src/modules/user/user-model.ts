import { Schema, model } from 'mongoose';
import IUser from './user-interface';
import mongoHelper from '@helpers/mongo-helper';

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
		},
		refreshToken: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

mongoHelper.hideFields(userSchema, ['password', 'refreshToken']);

const UserModel = model<IUser>('User', userSchema);
export default UserModel;
