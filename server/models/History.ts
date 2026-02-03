import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hsnCode: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    gstRate: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("History", historySchema);
