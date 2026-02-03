import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import paymentRoutes from "./routes/payment.routes";
import historyRoutes from "./routes/history.routes";
const app = express();

// app.use(express.json());
// app.use(cors({ origin: '*'}));
import path from 'path';


app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);


app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/history', historyRoutes);

/* ================= START SERVER ================= */

(async () => {
  await connectDB();

  const port = Number(process.env.PORT) || 5000;

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Auth server running on:
    - http://localhost:${port}
    - http://192.168.29.114:${port}`);
  });
})();
