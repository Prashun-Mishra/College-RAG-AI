import { Router } from "express";
import { body } from "express-validator";
import * as controller from "../controllers/documentController";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { validate } from "../middleware/validation";
import { uploadPdf } from "../middleware/upload";

const router = Router();
router.use(requireAuth);

router.get("/", controller.listDocuments);
router.get("/:id", controller.getDocument);

router.post(
  "/",
  requireAdmin,
  uploadPdf.single("file"),
  body("title").trim().isLength({ min: 2 }).withMessage("Please add a document title."),
  body("year").optional({ checkFalsy: true }).isInt({ min: 1900, max: 2200 }),
  validate,
  controller.uploadDocument
);

router.post("/:id/reprocess", requireAdmin, controller.reprocessDocument);
router.delete("/:id", requireAdmin, controller.deleteDocument);

export default router;
