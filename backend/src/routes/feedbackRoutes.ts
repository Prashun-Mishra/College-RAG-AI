import { Router } from "express";
import { body } from "express-validator";
import * as controller from "../controllers/feedbackController";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { validate } from "../middleware/validation";

const router = Router();
router.use(requireAuth);

router.post(
  "/",
  body("messageId").isMongoId(),
  body("rating").isIn(["up", "down"]),
  body("reason").optional().isIn(["incorrect", "missing_information", "poor_source", "not_relevant", "other"]),
  validate,
  controller.submitFeedback
);

router.get("/", requireAdmin, controller.listFeedback);

export default router;
