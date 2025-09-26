const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const allowedActions = new Schema({
	actions: { type: String, enum: ["add", "edit", "delete"], required: true },
});

const viewSchema = new Schema(
	{
		name: { type: String, required: true },
		table: { type: Schema.Types.ObjectId, required: true },
		columns: { type: [String], required: true },
		type: { type: String, enum: ["table", "detail"], required: true },
		allowedActions: {
			type: [String],
			required: true,
		},
		roles: { type: [String], required: true },
		filter: { type: String, required: false },
		userFilter: { type: String, required: false },
		editFilter: { type: String, required: false },
		editableCols: { type: [String], required: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("View", viewSchema);
