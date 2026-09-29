const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');

router.get('/', meetingController.getMeetings);
router.post('/', meetingController.scheduleMeeting);
router.put('/:id', meetingController.editMeeting);
router.delete('/:id', meetingController.cancelMeeting);

module.exports = router;
