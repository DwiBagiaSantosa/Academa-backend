import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser";
import globalRoutes from "./routes/globalRoutes.js";

const app = express();

dotenv.config();


const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api', globalRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})