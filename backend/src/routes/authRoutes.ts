import { Router } from "express";
import { body } from "express-validator";
import * as controller from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();

router.post(
  "/register",
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
  body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  validate,
  controller.registerUser
);

router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  validate,
  controller.loginUser
);

router.get("/me", requireAuth, controller.me);
router.post("/logout", controller.logout);
router.patch("/me", requireAuth, body("name").optional().trim().isLength({ min: 2 }), validate, controller.updateMe);
router.patch(
  "/password",
  requireAuth,
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters."),
  validate,
  controller.updatePassword
);

export default router;
