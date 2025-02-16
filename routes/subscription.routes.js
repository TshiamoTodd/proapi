import { Router } from "express";
import authorize  from "../middlewares/auth.middleware.js";
import {
    createSubscription, 
    getSubscriptionById, 
    getSubscriptions, 
    getUserSubscriptions
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, getSubscriptions);

subscriptionRouter.get("/:id", authorize, getSubscriptionById);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", (req, res) => res.send({ title: "UPDATE subscription" }));

subscriptionRouter.delete("/:id", (req, res) => res.send({ title: "DELETE subscription" }));

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", (req, res) => res.send({ title: "CANCEL subscription" }));

subscriptionRouter.get("/upcoming-renewals", (req, res) => res.send({ title: "GET all upcoming renewals" }));

export default subscriptionRouter;