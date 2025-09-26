const express = require("express");
const router = express.Router();

const SheetController = require("../controllers/sheetController");

router.get("/sheetInfo/", SheetController.getSheetInfo);
router.get("/inGlobalDevList/", SheetController.inGlobalDevList);
router.post("/editSheet/", SheetController.editSheetReq);

module.exports = router;
