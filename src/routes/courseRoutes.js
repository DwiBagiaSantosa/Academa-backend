import express from "express";
import { createCourse, getCourses, updateCourse, deleteCourse, getCategories } from "../controllers/courseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from "multer";
import { fileStorageCourse, fileFilter } from "../utils/multer.js";

const courseRoutes = express.Router();

const upload = multer({
    storage: fileStorageCourse,
    fileFilter
})

courseRoutes.get("/courses", verifyToken, getCourses)
courseRoutes.get("/categories", verifyToken, getCategories)
courseRoutes.post("/courses", verifyToken, upload.single('thumbnail'), createCourse)
courseRoutes.put("/courses/:id", verifyToken, upload.single('thumbnail'), updateCourse )
courseRoutes.delete("/courses/:id", verifyToken, deleteCourse)

export default courseRoutes;