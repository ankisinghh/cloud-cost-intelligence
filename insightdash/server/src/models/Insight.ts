import { Schema, model, InferSchemaType, Types } from "mongoose";

const ColumnStatsSchema = new Schema(
  {
    column: String,
    type: { type: String, enum: ["numeric", "categorical", "mixed", "empty"] },
    count: Number,
    unique: Number,
    avg: Number,
    min: Number,
    max: Number,
    sum: Number,
    topValues: [{ value: Schema.Types.Mixed, count: Number }],
  },
  { _id: false }
);

const InsightSchema = new Schema(
  {
    datasetId: { type: Schema.Types.ObjectId, ref: "Dataset", required: true, unique: true },
    stats: { type: [ColumnStatsSchema], default: [] },
    outliers: { type: Schema.Types.Mixed, default: {} },
    topN: { type: Schema.Types.Mixed, default: {} },
    recommendations: {
      type: [
        {
          severity: { type: String, enum: ["low", "medium", "high"] },
          title: String,
          description: String,
          recommendation: String,
          _id: false,
        },
      ],
      default: [],
    },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type InsightDoc = InferSchemaType<typeof InsightSchema> & { _id: Types.ObjectId };
export const Insight = model("Insight", InsightSchema);