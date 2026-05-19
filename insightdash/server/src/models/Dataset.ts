import { Schema, model, InferSchemaType, Types } from "mongoose";

const DatasetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    columnNames: { type: [String], default: [] },
    rowCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    storagePath: { type: String, required: false },
    error: { type: String },
  },
  { timestamps: true }
);

export type DatasetDoc = InferSchemaType<typeof DatasetSchema> & { _id: Types.ObjectId };
export const Dataset = model("Dataset", DatasetSchema);