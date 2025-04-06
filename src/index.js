import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser";
import globalRoutes from "./routes/globalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./utils/database.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import overviewRoutes from "./routes/overviewRoutes.js";

const app = express();

dotenv.config();

connectDB();

const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api', globalRoutes);
app.use('/api/v1', authRoutes)
app.use('/api/v1', paymentRoutes)
app.use('/api/v1', courseRoutes)
app.use('/api/v1', studentRoutes)
app.use('/api/v1', overviewRoutes)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})