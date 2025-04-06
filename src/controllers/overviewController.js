import courseModel from "../models/courseModel.js"
import userModel from "../models/userModel.js"


export const getOverview = async (req, res) => {
    try {
        const totalCourse = await courseModel.find({
            manager: req.user._id
        }).countDocuments()

        const courses = await courseModel.find({
            manager: req.user._id
        })

        const totalStudent = courses.reduce((total, course) => total + course.students.length, 0)

        const courseVideos = await courseModel.find({
            manager: req.user._id
        }).populate({
            path: 'details',
            select: 'name type',
            match: {
                type: 'video'
            }
        })
        
        const totalVideo = courseVideos.reduce((total, course) => total + course.details.length, 0)

        const courseText = await courseModel.find({
            manager: req.user._id
        }).populate({
            path: 'details',
            select: 'name type',
            match: {
                type: 'text'
            }
        })

        const totalText = courseText.reduce((total, course) => total + course.details.length, 0)

        const coursesList = await courseModel.find({
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

        const imageUrl = process.env.APP_URL + '/uploads/courses/'

        const responseCourses = coursesList.map((item) => {
            return {
                ...item.toObject(),
                thumbnail: imageUrl + item.thumbnail,
                total_students: item.students.length
            }
        })

        const students = await userModel.find({
            role: "student",
            manager: req.user._id
        }).select('name courses photo')

        const responseStudents = students.map((item) => {
            return {
                ...item.toObject(),
                photo_url: process.env.APP_URL + '/uploads/students/' + item.photo
            }
        })

        return res.status(200).json({
            message: "Get overview success",
            data: {
                totalCourse,
                totalStudent,
                totalVideo,
                totalText,
                courses: responseCourses,
                students: responseStudents
            }
        })
    } catch (error) {
        console.log("🚀 ~ getOverview ~ error:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}