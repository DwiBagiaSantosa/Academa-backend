import courseModel from "../models/courseModel.js"
import categoryModel from "../models/categoryModel.js"
import { categorySchema, mutateCourseSchema } from "../utils/schema.js"
import fs from "fs"
import userModel from "../models/userModel.js"
import path from "path"
import courseDetailModel from "../models/courseDetailModel.js"
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import { deleteImage, uploadImage } from "../utils/cloudinaryService.js"

export const getCourses = async (req, res) => {
    try {
        const courses = await courseModel.find({
            manager: req.user?._id
        })
        .select('name thumbnail')
        .populate({
            path: 'category',
            select: 'name -_id'
        })
        .populate({
            path: 'students',
            select: 'name'
        })

        // const imageUrl = process.env.APP_URL + '/uploads/courses/'

        const response = courses.map((item) => {
            return {
                ...item.toObject(),
                // thumbnail: imageUrl + item.thumbnail,
                total_students: item.students.length
            }
        })

        return res.status(200).json({
            message: "Get courses success",
            data: response
        })
    } catch (error) {
        console.log("🚀 ~ getCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find()

        return res.status(200).json({
            message: "Get categories success",
            data: categories
        })
    } catch (error) {
        console.log("🚀 ~ getCategories ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const createCategory = async (req, res) => {
    try {
        const body = req.body

        const parse = categorySchema.safeParse(body)

        if (!parse.success) {
            const errorMessage = parse.error.issues.map((err) => err.message)

            return res.status(4000).json({
                message: "Error Validation",
                data: null,
                error: errorMessage
            })
        }

        const category = new categoryModel({
            name: parse.data.name
        })

        await category.save()

        return res.status(200).json({
            message: "Create category success",
            data: category
        })

    } catch (error) {
        
    }
}

export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params
        const { preview } = req.query

        const course = await courseModel.findById(id)
        .populate({
            path: 'manager',
            select: 'name'
        })
        .populate({
            path: 'category',
            select: 'name'
        })
        .populate({
            path: 'details',
            select: preview === "true" ? 'title type youtubeId text' : 'title type'
        })

        const imageUrl = process.env.APP_URL + '/uploads/courses/'

        return res.status(200).json({
            message: "Get course detail success",
            data: {
                ...course.toObject(),
                // thumbnail_url: imageUrl + course.thumbnail
            }
        })
    } catch (error) {
        console.log("🚀 ~ getCourseById ~ error:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const createCourse = async (req, res) => {
    try {
        const body = req.body

        const parse = mutateCourseSchema.safeParse(body)

        if (!parse.success) {
            const errorMessage = parse.error.issues.map((err) => err.message)

            // if (req?.file.path && fs.existsSync(req?.file?.path)) {
            //     fs.unlinkSync(req?.file?.path)
            // }

            return res.status(500).json({
                message: "Error Validation",
                data: null,
                error: errorMessage
            })
        }

        const category = await categoryModel.findById(parse.data.categoryId)

        if (!category) {
            return res.status(500).json({
                message: "Category not found",
            })
        }

        // upload image to cloudinary
        let thumbnail = null;

        if (req.file) {
            const result = await uploadImage(req.file.buffer, { folder: 'courses' })
            
            thumbnail = {
                url: result.secure_url,
                public_id: result.public_id
            }
        }

        const course = new courseModel({
            name: parse.data.name,
            category: category._id,
            description: parse.data.description,
            tagline: parse.data.tagline,
            thumbnail,
            manager: req.user._id
        })

        await course.save()

        await categoryModel.findByIdAndUpdate(category._id, {
            $push: {
                courses: course._id
            },
            
        },
        {
            new: true
        })

        await userModel.findByIdAndUpdate(req.user._id, {
            $push: {
                courses: course._id
            }
        }, { new: true })

        return res.json({
            message: "Create course success",
            data: course
        })
    } catch (error) {
        console.log("🚀 ~ createCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const updateCourse = async (req, res) => {
    try {
        const body = req.body
        const courseId = req.params.id

        const parse = mutateCourseSchema.safeParse(body)

        if (!parse.success) {
            const errorMessage = parse.error.issues.map((err) => err.message)

            // if (req?.file.path && fs.existsSync(req?.file?.path)) {
            //     fs.unlinkSync(req?.file?.path)
            // }

            return res.status(400).json({
                message: "Error Validation",
                data: null,
                error: errorMessage
            })
        }

        const category = await categoryModel.findById(parse.data.categoryId)
        const oldCourse = await courseModel.findById(courseId)

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            })
        }

        let thumbnail = oldCourse.thumbnail

        if (req.file) {
            // delete old image from cloudinary
            if (oldCourse.thumbnail?.public_id){
                await deleteImage(oldCourse.thumbnail.public_id)
            }

            // upload new image to cloudinary
            const result = await uploadImage(req.file.buffer, { folder: 'courses' })
            
            thumbnail = {
                url: result.secure_url,
                public_id: result.public_id
            }
        }

        await courseModel.findByIdAndUpdate(courseId, {
            name: parse.data.name,
            category: category._id,
            description: parse.data.description,
            tagline: parse.data.tagline,
            thumbnail,
            manager: req.user._id
        })

        return res.json({
            message: "Courses update success",
        })
    } catch (error) {
        console.log("🚀 ~ createCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params

        const course = await courseModel.findById(id)

        // const dirname = path.resolve()

        // const filePath = path.join(dirname, "public/uploads/courses", course.thumbnail)

        // if (fs.existsSync(filePath)) {
        //     fs.unlinkSync(filePath)
        // }

        // delete image from cloudinary
        if (course?.thumbnail?.public_id){
            await deleteImage(course.thumbnail.public_id)
        }

        await courseModel.findByIdAndDelete(id)

        return res.json({
            message: "Delete course success",
        })
    } catch (error) {
        console.log("🚀 ~ deleteCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const createCourseContent = async (req, res) => {
    try {
        const body = req.body

        const course = await courseModel.findById(body.courseId)

        const content = new courseDetailModel({
            title: body.title,
            type: body.type,
            course: course._id,
            text: body.text,
            youtubeId: body.youtubeId
        })

        await content.save()

        await courseModel.findByIdAndUpdate(course._id, {
            $push: {
                details: content._id
            }
        }, {new: true})

        return res.json({
            message: "Create content success",
            data: content
        })
    } catch (error) {
        console.log("🚀 ~ deleteCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const updateCourseContent = async (req, res) => {
    try {
        const { id } = req.params

        const body = req.body

        const course = await courseModel.findById(body.courseId)

        const updatedContent = await courseDetailModel.findByIdAndUpdate(id, {
            title: body.title,
            type: body.type,
            course: course._id,
            text: body.text,
            youtubeId: body.youtubeId
        }, {new: true})

        return res.json({
            message: "Update content success",
            data: updatedContent
        })
    } catch (error) {
        console.log("🚀 ~ deleteCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const deleteCourseContent = async (req, res) => {
    try {
        const { id } = req.params

        await courseDetailModel.findByIdAndDelete(id)

        return res.json({
            message: "Delete content success",
        })
    } catch (error) {
        console.log("🚀 ~ deleteCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getDetailContent = async (req, res) => {
    try {
        const { id } = req.params

        const content = await courseDetailModel.findById(id)

        return res.json({
            message: "Get Course detail content success",
            data: content
        })
    } catch (error) {
        console.log("🚀 ~ deleteCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getStudentByCourseId = async (req, res) => {
    try {
        const {id} = req.params

        const course = await courseModel.findById(id).select('name').populate({
            path: 'students',
            select: 'name email photo'
        })

        const students = course.students.map((item) => {
            return {
                ...item.toObject(),
                // photo_url: process.env.APP_URL + '/uploads/students/' + item.photo
            }
        })

        return res.json({
            message: "Get student by course id success",
            data: {
                ...course.toObject(),
                students
            }
        })
    } catch (error) {
        console.log("🚀 ~ getStudentByCourseId ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const addStudentToCourse = async (req, res) => {
    try {
        const {id} = req.params
        const body = req.body

        await userModel.findByIdAndUpdate(body.studentId, {
            $push: {
                courses: id
            }
        })

        await courseModel.findByIdAndUpdate(id, {
            $push: {
                students: body.studentId
            }
        })

        return res.json({
            message: "Add student to course success",
        })
    } catch (error) {
        console.log("🚀 ~ addStudentToCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const deleteStudentFromCourse = async (req, res) => {
    try {
        const {id} = req.params
        const body = req.body

        await userModel.findByIdAndUpdate(body.studentId, {
            $pull: {
                courses: id
            }
        })

        await courseModel.findByIdAndUpdate(id, {
            $pull: {
                students: body.studentId
            }
        })

        return res.json({
            message: "Delete student to course success",
        })
    } catch (error) {
        console.log("🚀 ~ deleteStudentToCourse ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}