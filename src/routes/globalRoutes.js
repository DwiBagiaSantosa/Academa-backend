import express from "express";
import { helloWorld } from "../controllers/globalController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { exampleSchema } from "../utils/schema.js";

const globalRoutes = express.Router();

globalRoutes.get("/hello-word", helloWorld);
globalRoutes.post("/test-validate", validateRequest(exampleSchema), async (req, res) => {
    return res.status(200).json(req.body);
});

export default globalRoutes;