const express = require('express');
const router = express.Router();

router.get('', require('./personalityGET'));
router.get('/today', require('./personalityTodayGET'));
router.get('/new', require('./personalityNewGET'));
router.get('/me', require('./personalityMeGET'));
router.patch('/me', require('./personalityMePATCH'));
router.get('/date', require('./personalityDateGET'));
router.get('/recent', require('./personalityRecentGET'));
router.get('/all', require('./personalityAllGET'));
router.patch('/check', require('./personalityCheckPATCH'));
router.post('/today', require('./personalityTodayPOST'));
router.post('/new', require('./personalityNewPOST'));
router.post('/scheduling', require('./personalitySchedulingPOST'));

module.exports = router;
