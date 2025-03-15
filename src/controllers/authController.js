import bcrypt from "bcryptjs"
import userModel from "../models/userModel.js"
import TranscationModel from "../models/transactionModel.js"

export const signUpAction = async (req, res) => {
    const midtransUrl = process.env.MIDTRANS_URL
    const midtransAuthString = process.env.MIDTRANS_AUTH_STRING
    const frontendUrl = process.env.FRONTEND_BASE_URL

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
        const transaction = new TranscationModel({
            user: user._id,
            price: 280000
        })

        const midtrans = await fetch(midtransUrl, {
            method: "POST",
            body: JSON.stringify({
                transaction_details: {
                    order_id: transaction._id.toString(),
                    gross_amount: transaction.price
                },
                credit_card:{
                    secure : true
                },
                customer_details: {
                    email: user.email,
                },
                callbacks:{
                    finish: `${frontendUrl}/success-checkout`
                }
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${midtransAuthString}`
            }
        })

        const resMidtrans = await midtrans.json()

        await user.save()
        await transaction.save()

        return res.json({
            message: "sign up success",
            data: {
                midtrans_payment_url: resMidtrans.redirect_url
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        })
    }
}