import { Schema, model, InferSchemaType, Types } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: Types.ObjectId };
export const User = model("User", UserSchema);