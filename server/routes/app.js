const express = require('express');
const router = express.Router();

const AppController = require('../controllers/appController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.post('/createApp/', AppController.createApp);
router.get('/getApps/', AppController.getApps);
router.put('/updateApp/', AppController.updateApp);
router.get('/getAppById/', AppController.getAppById);
router.delete('/deleteApp/', AppController.deleteApp);
router.put('/updateRoles/', AppController.updateRoles);

module.exports = router;
