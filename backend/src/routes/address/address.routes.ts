/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Customer shipping addresses
 */

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Address created
 *   get:
 *     summary: Get the current user's addresses
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated addresses
 */

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Get an address by ID (owner only)
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Address details
 *   patch:
 *     summary: Update an address (owner only)
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Address updated
 *   delete:
 *     summary: Delete an address (owner only)
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Address deleted
 */

/**
 * @swagger
 * /addresses/{id}/default:
 *   patch:
 *     summary: Set an address as the default (owner only)
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Default address set
 */

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
import { validateObjectId } from "../../middleware/validateObjectId.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../../validators/address/address.validator";

const router = Router();

router.use(authenticate);

router.post("/", validate(createAddressSchema), createAddress);
router.get("/", getMyAddresses);
router.get("/:id", validateObjectId("id"), getAddressById);
router.patch("/:id", validateObjectId("id"), validate(updateAddressSchema), updateAddress);
router.patch("/:id/default", validateObjectId("id"), setDefaultAddress);
router.delete("/:id", validateObjectId("id"), deleteAddress);

export default router;
