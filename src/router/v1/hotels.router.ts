import { Router } from "express";
import { asyncHandler } from "../../core/http/asyncHandler";
import { requireAuth } from "../../core/middleware/requireAuth";
import { HotelsService } from "../../services/hotels.service";
import { createHotelsController } from "../../controllers/hotels.controller";
import { hasPermission } from "../../core/middleware/hasPermission";

export function createHotelsRouter(hotelsService: HotelsService, authService: any): Router {
  const router = Router();
  const controller = createHotelsController(hotelsService);

  router.use(requireAuth(authService));

  router.get("/", hasPermission("hotels", "read"), asyncHandler(controller.list.bind(controller)));
  router.get("/:id", hasPermission("hotels", "read"), asyncHandler(controller.get.bind(controller)));

  router.post("/", hasPermission("hotels", "write"), asyncHandler(controller.create.bind(controller)));
  router.put("/:id", hasPermission("hotels", "write"), asyncHandler(controller.update.bind(controller)));
  router.patch("/:id", hasPermission("hotels", "write"), asyncHandler(controller.update.bind(controller)));
  router.delete("/:id", hasPermission("hotels", "write"), asyncHandler(controller.remove.bind(controller)));

  return router;
}

export default createHotelsRouter;
