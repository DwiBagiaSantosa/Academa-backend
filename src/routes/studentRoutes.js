import express from "express";
import { getStudents } from "../controllers/studentController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const studentRoutes = express.Router();

studentRoutes.get('/students', verifyToken, getStudents)

export default studentRoutes