"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const history_routes_1 = __importDefault(require("./routes/history.routes"));
const app = (0, express_1.default)();
// app.use(express.json());
// app.use(cors({ origin: '*'}));
const path_1 = __importDefault(require("path"));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// app.use(cookieParser());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/payment', payment_routes_1.default);
app.use('/api/history', history_routes_1.default);
/* ================= START SERVER ================= */
(async () => {
    await (0, db_1.connectDB)();
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Auth server running on:
    - http://localhost:${port}
    - http://192.168.29.114:${port}`);
    });
})();
