import { MongoHelper } from '@helpers/mongo-helper';
import { PrivacyEnum, schemaPrivacyFields } from '@interfaces/privacy-interface';
import { Model, Schema, model } from 'mongoose';
import IUser, { ContactTypeEnum, GenderEnum } from './user-interface';

interface UserModel extends Model<IUser> {
	findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>(
	{
		// Account
		email: {
			value: {
				type: String,
				required: true,
				unique: true,
			},
			...schemaPrivacyFields,
			privacy: {
				type: String,
				enum: PrivacyEnum,
				default: PrivacyEnum.PRIVATE,
			},
		},
		password: {
			type: String,
		},
		refreshTokens: {
			type: [String],
		},
		loginAttempts: {
			type: Number,
			default: 0,
		},

		// Info
		name: {
			type: String,
			required: true,
		},
		gender: {
			value: {
				type: String,
				enum: GenderEnum,
				default: GenderEnum.OTHER,
			},
			...schemaPrivacyFields,
		},
		location: {
			country: {
				value: {
					type: String,
				},
				...schemaPrivacyFields,
			},
			city: {
				value: {
					type: String,
				},
				...schemaPrivacyFields,
			},
			detail: {
				value: {
					type: String,
				},
				...schemaPrivacyFields,
			},
		},
		contacts: [
			{
				type: {
					type: String,
					enum: ContactTypeEnum,
					required: true,
				},
				value: {
					type: String,
					required: true,
				},
				...schemaPrivacyFields,
			},
		],

		// Lock
		isLocked: {
			type: Boolean,
			default: false,
		},
		lockUntil: {
			type: Date,
			default: null,
		},
		lockReason: {
			type: String,
			default: null,
		},

		// Privacy
		...schemaPrivacyFields,
	},
	{
		timestamps: true,
		statics: {
			findByEmail: async function (email: string) {
				return this.findOne({ 'email.value': email }).exec();
			},
		},
	},
);

const mongoHelper = new MongoHelper(userSchema);
mongoHelper.hideFields(['password', 'refreshTokens', 'loginAttempts', 'isLocked', 'lockUntil', 'lockReason']);

const UserModel = model<IUser, UserModel>('User', userSchema);
export default UserModel;
