import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getMyAddresses,
  setDefaultAddress,
  updateAddress,
} from "../../controllers/address/address.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", createAddress);
router.get("/", getMyAddresses);
router.get("/:id", getAddressById);
router.patch("/:id", updateAddress);
router.patch("/:id/default", setDefaultAddress);
router.delete("/:id", deleteAddress);

export default router;
