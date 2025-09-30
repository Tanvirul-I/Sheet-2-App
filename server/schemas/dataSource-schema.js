const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataSourceSchema = new Schema(
  {
    name: { type: String, required: true },
    url: {
      type: String,
      required: true,
    },
    spreadsheetId: {
      type: String,
      required: true,
    },
    gid: { type: String, required: true },
    key: { type: String, required: true },
    columns: {
      type: [
        {
          name: { type: String, required: true },
          initValue: { type: Schema.Types.Mixed, required: false },
          label: { type: Boolean, required: true },
          reference: { type: Schema.Types.ObjectId, required: false },
          type: {
            type: String,
            enum: ["boolean", "number", "text", "URL"],
            required: true,
          },
        },
      ],
      required: true,
    },
    published: { type: Boolean, required: true },
    creator: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DataSource", dataSourceSchema);
