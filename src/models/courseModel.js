import mongoose from "mongoose";
import categoryModel from "./categoryModel.js";
import courseDetailModel from "./courseDetailModel.js";
import userModel from "./userModel.js";

const courseModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    thumbnail: {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    tagline: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    students:[ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    details: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseDetail"
        }
    ]
})

courseModel.post('findOneAndDelete', async (doc) => {
    if(doc){
        await categoryModel.findByIdAndUpdate(doc.category, {
            $pull: {
                courses: doc._id
            }
        })

        await courseDetailModel.deleteMany({ course: doc._id })

        doc.students?.map(async (student) => {
            await userModel.findByIdAndUpdate(student._id, {
                $pull:{
                    courses: doc._id
                }
            })
        })
    }
})

export default mongoose.model("Course", courseModel);