import mongoose from "mongoose";
const { Schema, model } = mongoose;

const EntitySchema = new Schema(
	{
		// Store multiple entity names
		entities: {
			type: [String],
			required: true,
			default: [],
			index: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

const EntityModel = model("Entity", EntitySchema);
export default EntityModel;
