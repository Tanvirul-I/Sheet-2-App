const express = require("express");
const router = express.Router();

const SheetController = require("../controllers/sheetController");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.get("/sheetInfo/", SheetController.getSheetInfo);
router.get("/inGlobalDevList/", SheetController.inGlobalDevList);
router.post("/editSheet/", SheetController.editSheetReq);

module.exports = router;
