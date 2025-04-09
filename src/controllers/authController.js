import bcrypt from "bcryptjs"
import userModel from "../models/userModel.js"
import transcationModel from "../models/transactionModel.js"
import jwt from "jsonwebtoken"

export const signUpAction = async (req, res) => {
    const midtransUrl = process.env.MIDTRANS_URL
    const midtransAuthString = process.env.MIDTRANS_AUTH_STRING
    const frontendUrl = process.env.FRONTEND_BASE_URL

    try {
        const body = req.body

        const hashPassword = bcrypt.hashSync(body.password, 12)

        const user = new userModel({
            name: body.name,
            photo: {
                url: "default.png",
                public_id: "default"
            },
            email: body.email,
            password: hashPassword,
            role: 'manager' // for future feature change it to body.role
        })

        // action payment gateway
        // const transaction = new transcationModel({
        //     user: user._id,
        //     price: 280000
        // })

        // const midtrans = await fetch(midtransUrl, {
        //     method: "POST",
        //     body: JSON.stringify({
        //         transaction_details: {
        //             order_id: transaction._id.toString(),
        //             gross_amount: transaction.price
        //         },
        //         credit_card:{
        //             secure : true
        //         },
        //         customer_details: {
        //             email: user.email,
        //         },
        //         callbacks:{
        //             finish: `${frontendUrl}/success-checkout`
        //         }
        //     }),
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": `Basic ${midtransAuthString}`
        //     }
        // })

        // const resMidtrans = await midtrans.json()

        await user.save()
        
        const token = jwt.sign(
            {
                data: {
                    id: user._id.toString(),
                }
            },
            process.env.SECRET_KEY_JWT,
            {
                expiresIn: "1d"
            }
        )

        // await transaction.save()

        const { name, email, role } = user

        return res.json({
            message: "sign up success",
            data: {
                name,
                email,
                role,
                token
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
}

export const signInAction = async (req, res) => {
    try {
        const body = req.body

        const existingUser = await userModel.findOne().where("email").equals(body.email)

        if (!existingUser) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        const comparePassword = bcrypt.compareSync(body.password, existingUser.password)

        if (!comparePassword) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        // const isValidUser = await transcationModel.findOne({
        //     user: existingUser._id,
        //     status: "success"
        // })

        // if (existingUser.role !== "student" && !isValidUser) {
        //     return res.status(400).json({
        //         message: "User not verified"
        //     })
        // }

        const token = jwt.sign(
            {
                data: {
                    id: existingUser._id.toString(),
                }
            },
            process.env.SECRET_KEY_JWT,
            {
                expiresIn: "1 days"
            }
        )

        return res.json({
            message: "Sign in success",
            data: {
                name: existingUser.name,
                email: existingUser.email,
                token,
                role: existingUser.role
            }
        })
    } catch (error) {
        console.log("🚀 ~ signInAction ~ error:", error)
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
}