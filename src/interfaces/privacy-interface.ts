import { Schema } from 'mongoose';

export enum PrivacyEnum {
	PUBLIC = 'public', // Default
	PRIVATE = 'private', // Only me
	FRIENDS = 'friends', // Only friends
	INCLUDES = 'includes', // Only friends and includes
	EXCLUDES = 'excludes', // Only friends and excludes
}

export default interface IPrivacy {
	privacy: PrivacyEnum;
	includes: (string | Schema.Types.ObjectId)[];
	excludes: (string | Schema.Types.ObjectId)[];
}

export interface IPrivacyField<T> extends IPrivacy {
	value: T;
}

/** For use in mongoose schema */
export const schemaPrivacyFields = {
	privacy: {
		type: String,
		enum: PrivacyEnum,
		default: PrivacyEnum.PUBLIC,
	},
	includes: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		default: [],
	},
	excludes: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		default: [],
	},
};
