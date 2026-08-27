import { Router } from "express";
import * as controller from "../controllers/adminController";
import * as documentController from "../controllers/documentController";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/dashboard", controller.dashboard);
router.get("/analytics", controller.analytics);
router.get("/documents", documentController.listDocuments);

export default router;
