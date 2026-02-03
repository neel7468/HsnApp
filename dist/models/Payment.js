"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true, // ✅ IMPORTANT
    },
    orderId: { type: String, required: true },
    paymentId: String,
    signature: String,
    amount: { type: Number, required: true },
    planName: { type: String, required: true },
    status: {
        type: String,
        enum: ["CREATED", "SUCCESS", "FAILED"],
        default: "CREATED",
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Payment", paymentSchema);
