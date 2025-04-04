import express from "express";
import { createCourse, getCourses, updateCourse, deleteCourse, getCategories, getCourseById, createCourseContent, updateCourseContent, deleteCourseContent, getDetailContent, getStudentByCourseId, addStudentToCourse } from "../controllers/courseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from "multer";
import { fileStorageCourse, fileFilter } from "../utils/multer.js";
import { addStudentCourseSchema, mutateContentSchema } from "../utils/schema.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const courseRoutes = express.Router();

const upload = multer({
    storage: fileStorageCourse,
    fileFilter
})

courseRoutes.get("/courses", verifyToken, getCourses)
courseRoutes.get("/categories", verifyToken, getCategories)
courseRoutes.get("/courses/:id", verifyToken, getCourseById)
courseRoutes.post("/courses", verifyToken, upload.single('thumbnail'), createCourse)
courseRoutes.put("/courses/:id", verifyToken, upload.single('thumbnail'), updateCourse )
courseRoutes.delete("/courses/:id", verifyToken, deleteCourse)

courseRoutes.post("/courses/contents", verifyToken, validateRequest(mutateContentSchema), createCourseContent)
courseRoutes.put("/courses/contents/:id", verifyToken, validateRequest(mutateContentSchema), updateCourseContent)
courseRoutes.delete("/courses/contents/:id", verifyToken, deleteCourseContent)
courseRoutes.get("/courses/contents/:id", verifyToken, getDetailContent)

courseRoutes.get('/courses/students/:id', verifyToken, getStudentByCourseId)
courseRoutes.post('/courses/students/:id', verifyToken, validateRequest(addStudentCourseSchema) , addStudentToCourse)

export default courseRoutes;