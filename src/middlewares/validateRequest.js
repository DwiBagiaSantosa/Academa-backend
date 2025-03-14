import { ZodError } from "zod";

export const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map((err) => err.message);
            return res.status(500).json({
                error: "Invalid request",
                message: errorMessages
            })
        }

        res.status(500).json({
            error: "Internal Server Error",
        })
    }
}