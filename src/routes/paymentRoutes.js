import express from "express";
import { handlePayment } from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.post("/handle-payment", handlePayment);

export default paymentRoutes;