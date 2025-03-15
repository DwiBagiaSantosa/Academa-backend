import bcrypt from "bcryptjs"
import userModel from "../models/userModel.js"

export const signUpAction = async (req, res) => {
    try {
        const body = req.body

        const hashPassword = await bcrypt.hashSync(body.password, 12)

        const user = new userModel({
            name: body.name,
            photo: "default.png",
            email: body.email,
            password: hashPassword,
            role: "manager"
        })

        // action payment gateway

        await user.save()

        return res.json({
            message: "sign up success",
            data: {
                midtrans: "https://midtrans.com"
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
}