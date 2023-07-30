import IMongoData from '@interfaces/mongo-data-interface';
import IPrivacy, { IPrivacyField } from '@interfaces/privacy-interface';

export default interface IUser extends IMongoData, IPrivacy {
	// Account
	email: IPrivacyField<string>;
	password: string;
	refreshTokens: string[];
	loginAttempts: number;

	// Info
	name: string;
	gender: IGender;
	location: ILocation;
	hometown: ILocation;
	contacts: IContact[];

	// Lock
	isLocked: boolean;
	lockUntil: Date | null;
	lockReason: string | null;
}

export interface IGender extends IPrivacyField<GenderEnum> {}

export enum GenderEnum {
	MALE = 'male',
	FEMALE = 'female',
	OTHER = 'other',
}

export interface ILocation extends IPrivacy {
	country: IPrivacyField<string>;
	city: IPrivacyField<string>;
	detail: IPrivacyField<string>;
}

export interface IContact extends IPrivacy {
	type: ContactTypeEnum;
	value: string;
}

export enum ContactTypeEnum {
	EMAIL = 'email',
	PHONE = 'phone',
	FACEBOOK = 'facebook',
	TWITTER = 'twitter',
	INSTAGRAM = 'instagram',
	LINKEDIN = 'linkedin',
}
