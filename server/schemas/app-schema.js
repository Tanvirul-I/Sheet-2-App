const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appSchema = new Schema(
	{
		name: { type: String, required: true },
		creator: { type: String, required: true },
		dataSources: { type: [Schema.Types.ObjectId], required: true },
		view: { type: [Schema.Types.ObjectId], required: true },
		roleSheet: { type: String, required: true },
		roles: {
			type: [
				{
					name: { type: String, required: true },
					members: { type: [String], required: true },
				},
			],
			required: true,
		},
		published: { type: Boolean, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("App", appSchema);
