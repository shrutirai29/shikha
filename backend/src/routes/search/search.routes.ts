import { Router } from "express";
import { searchProducts } from "../../controllers/search/search.controller";

const router = Router();

router.get("/products", searchProducts);

export default router;
