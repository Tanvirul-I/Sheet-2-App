const express = require('express');
const router = express.Router();

const DataController = require('../controllers/dataController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.post('/createDataSource/', DataController.createDataSource);
router.put('/updateDataSource/', DataController.updateDataSource);
router.get('/getDataSourceById/', DataController.getDataSourceById);
router.delete('/deleteDataSource/', DataController.deleteDataSource);

module.exports = router;
