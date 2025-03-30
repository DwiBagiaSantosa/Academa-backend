import express from "express";
import { createStudent, getStudents, updateStudent } from "../controllers/studentController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from "multer";
import { fileFilter, fileStorage } from "../utils/multer.js";

const studentRoutes = express.Router();

const upload = multer({
    storage: fileStorage('students'),
    fileFilter
})

studentRoutes.get('/students', verifyToken, getStudents)

studentRoutes.post('/students', verifyToken, upload.single('avatar'), createStudent)

studentRoutes.put('/students/:id', verifyToken, upload.single('avatar'), updateStudent)

export default studentRoutes