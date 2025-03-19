import express from "express";
import { createCourse, getCourses } from "../controllers/courseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from "multer";
import { fileStorageCourse, fileFilter } from "../utils/multer.js";

const courseRoutes = express.Router();

const upload = multer({
    storage: fileStorageCourse,
    fileFilter
})

courseRoutes.get("/courses", verifyToken, getCourses)
courseRoutes.post("/courses", verifyToken, upload.single('thumbnail'), createCourse)

export default courseRoutes;