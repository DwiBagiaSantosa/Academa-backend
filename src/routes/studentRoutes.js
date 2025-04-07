import express from "express";
import { createStudent, deleteStudent, getCourseByStudentId, getStudentById, getStudents, updateStudent } from "../controllers/studentController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from "multer";
import { fileFilter, fileStorage } from "../utils/multer.js";

const studentRoutes = express.Router();

const upload = multer({
    storage: fileStorage('students'),
    fileFilter
})

studentRoutes.get('/students', verifyToken, getStudents)

studentRoutes.get('/students/:id', verifyToken, getStudentById)

studentRoutes.post('/students', verifyToken, upload.single('avatar'), createStudent)

studentRoutes.put('/students/:id', verifyToken, upload.single('avatar'), updateStudent)

studentRoutes.delete('/students/:id', verifyToken, deleteStudent)

studentRoutes.get('/students-courses', verifyToken, getCourseByStudentId)

export default studentRoutes