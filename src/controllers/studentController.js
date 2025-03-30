import userModel from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { mutateStudentSchema } from "../utils/schema.js"

export const getStudents = async (req, res) => {
    try {
        const students = await userModel.find({
            role: "student",
            manager: req.user._id
        })

        return res.json({
            message: "Get students success",
            data: students
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

            if (req?.file.path && fs.existsSync(req?.file?.path)) {
                fs.unlinkSync(req?.file?.path)
            }

            return res.status(500).json({
                message: "Error Validation",
                data: null,
                error: errorMessage
            })
        }

        const hashPassword = bcrypt.hashSync(body.password, 12)

        const student = new userModel({
            name: parse.data.name,
            email: parse.data.email,
            password: hashPassword,
            photo: req.file?.filename,
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