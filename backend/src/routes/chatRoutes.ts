import { Router } from "express";
import { body } from "express-validator";
import * as controller from "../controllers/chatController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();
router.use(requireAuth);

router.post(
  "/",
  body("question").trim().isLength({ min: 2, max: 1000 }).withMessage("Please enter a question."),
  validate,
  controller.ask
);

router.get("/conversations", controller.listConversations);
router.post("/conversations", controller.createConversation);
router.get("/conversations/:id", controller.getConversation);
router.patch("/conversations/:id", body("title").trim().isLength({ min: 1, max: 120 }), validate, controller.renameConversation);
router.delete("/conversations/:id", controller.deleteConversation);

export default router;
