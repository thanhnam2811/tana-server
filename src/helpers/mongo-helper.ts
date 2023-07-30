import { Schema } from 'mongoose';

export class MongoHelper {
	private schema: Schema;

	constructor(schema: Schema) {
		this.schema = schema;
	}

	/**
	 * Hide fields from schema when converting to JSON (e.g. when returning a document)
	 * @param fields fields to hide
	 */
	public hideFields(fields: string[]) {
		const hideFieldTransform = {
			transform: (_, ret) => {
				fields.forEach((field) => delete ret[field]);
			},
		};

		this.schema.set('toJSON', hideFieldTransform);
		this.schema.set('toObject', hideFieldTransform);
	}
}
