const meetingService = require('../services/meetingService');

exports.getMeetings = async (req, res) => {
    try {
        const meetings = await meetingService.getAllMeetings();
        res.status(200).json(meetings);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
};

exports.scheduleMeeting = async (req, res) => {
    try {
        const { username, email, time } = req.body;
        const newMeeting = await meetingService.scheduleMeeting(username, email, time);
        res.status(201).json(newMeeting);
    } catch (err) {
        console.log(err);
        const errorMessage = err.message || 'Failed to schedule meeting';
        const statusCode = errorMessage.includes('booked') ? 400 : 500;
        res.status(statusCode).json({ error: errorMessage });
    }
};

exports.cancelMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        await meetingService.cancelMeeting(id);
        res.status(200).json({ message: 'Meeting canceled successfully' });
    } catch (err) {
        console.log(err);
        const errorMessage = err.message || 'Failed to cancel meeting';
        const statusCode = errorMessage.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: errorMessage });
    }
};

exports.editMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { time } = req.body;
        
        const meeting = await meetingService.editMeeting(id, time);
        res.status(200).json(meeting);
    } catch (err) {
        console.log(err);
        const errorMessage = err.message || 'Failed to edit meeting';
        const statusCode = errorMessage.includes('not found') ? 404 : (errorMessage.includes('booked') ? 400 : 500);
        res.status(statusCode).json({ error: errorMessage });
    }
};
