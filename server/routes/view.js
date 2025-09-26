const express = require("express");
const router = express.Router();

const ViewController = require("../controllers/viewController");

router.post("/createView/", ViewController.createView);
router.put("/updateView/", ViewController.updateView);
router.get("/getViewById/", ViewController.getViewById);
router.delete("/deleteView/", ViewController.deleteView);

module.exports = router;
