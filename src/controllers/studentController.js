import userModel from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { mutateStudentSchema } from "../utils/schema.js"
import courseModel from "../models/courseModel.js"
import fs from "fs"
import path from "path"
import { deleteImage, uploadImage } from "../utils/cloudinaryService.js"

export const getStudents = async (req, res) => {
    try {
        const students = await userModel.find({
            role: "student",
            manager: req.user._id
        }).select('name courses photo')

        const response = students.map((item) => {
            return {
                ...item.toObject(),
                // photo_url: process.env.APP_URL + '/uploads/students/' + item.photo
            }
        })

        return res.json({
            message: "Get students success",
            data: response
        })
    } catch (error) {
        console.log("🚀 ~ getStudents ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params

        const student = await userModel.findById(id).select('name email')

        return res.json({
            message: "Get detail student success",
            data: student
        })
    } catch (error) {
        console.log("🚀 ~ getStudents ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const createStudent = async (req, res) => {
    try {
        const body = req.body

        const parse = mutateStudentSchema.safeParse(body)

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

        const hashPassword = bcrypt.hashSync(body.password, 12)

        let photo = null

        if (req.file) {
            const result = await uploadImage(req.file.buffer, { folder: "students" })

            photo = {
                public_id: result.public_id,
                url: result.secure_url
            }
        }

        const student = new userModel({
            name: parse.data.name,
            email: parse.data.email,
            password: hashPassword,
            photo,
            manager: req.user?._id,
            role: "student"
        })

        await student.save()

        return res.json({
            message: "Create student success",
        })
    } catch (error) {
        console.log("🚀 ~ createStudent ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params
        const body = req.body

        const parse = mutateStudentSchema.partial({
            password: true
        }).safeParse(body)

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

        const student = await userModel.findById(id)

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            })
        }

        const hashPassword = parse.data?.password ? bcrypt.hashSync(parse.data.password, 12) : student.password

        let updatedPhoto = student.photo;

        if (req.file) {
            if (student.photo?.public_id) {
                await deleteImage(student.photo.public_id)
            }

            const result = await uploadImage(req.file.buffer, { folder: "students" })

            updatedPhoto = {
                url: result.secure_url,
                public_id: result.public_id
            }
        }

        const updatedStudent = await userModel.findByIdAndUpdate(id, {
            name: parse.data.name,
            email: parse.data.email,
            password: hashPassword,
            photo: updatedPhoto,
        }, { new: true })

        

        // await student.save()

        return res.json({
            message: "Update student success",
            data: updatedStudent
        })
    } catch (error) {
        console.log("🚀 ~ createStudent ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params

        const student = await userModel.findById(id)

        await courseModel.findOneAndUpdate({
            students: id
        },{
            $pull: {
                students: id
            }
        })

        const dirname = path.resolve()

        const filePath = path.join(dirname, "public/uploads/students", student.photo)

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

        await userModel.findByIdAndDelete(id)

        return res.json({
            message: "Delete student success",
        })
    } catch (error) {
        console.log("🚀 ~ deleteStudent ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getCourseByStudentId = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate({
            path: "courses",
            select: "name category thumbnail",
            populate: {
                path: "category",
                select: "name"
            }
        })

        const response = user?.courses?.map((item) => {
            return {
                ...item.toObject(),
                thumbnail_url: process.env.APP_URL + '/uploads/courses/' + item.thumbnail
            }
        })

        return res.json({
            message: "Get course by student id success",
            data: response
        })
    } catch (error) {
        console.log("🚀 ~ getCourseByStudentId ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}