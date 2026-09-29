const Meeting = require('../models/meeting');

exports.getAllMeetings = async () => {
    return await Meeting.findAll();
};

exports.scheduleMeeting = async (username, email, time) => {
    const existingMeetings = await Meeting.findAll({ where: { time } });
    
    if (existingMeetings.length >= 3) {
        throw new Error('All 3 slots for this time are already booked. Please choose another time.');
    }

    const bookedSlots = existingMeetings.map(m => m.slotNumber);
    let availableSlot = 1;
    for (let i = 1; i <= 3; i++) {
        if (!bookedSlots.includes(i)) {
            availableSlot = i;
            break;
        }
    }

    return await Meeting.create({
        username,
        email,
        time,
        slotNumber: availableSlot
    });
};

exports.cancelMeeting = async (id) => {
    const result = await Meeting.destroy({ where: { id } });
    if (!result) {
        throw new Error('Meeting not found');
    }
    return result;
};

exports.editMeeting = async (id, time) => {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
        throw new Error('Meeting not found');
    }

    if (meeting.time === time) {
         // same time, do nothing
         return meeting;
    }

    const existingMeetings = await Meeting.findAll({ where: { time } });
    if (existingMeetings.length >= 3) {
        throw new Error('All 3 slots for this new time are already booked.');
    }

    const bookedSlots = existingMeetings.map(m => m.slotNumber);
    let availableSlot = 1;
    for (let i = 1; i <= 3; i++) {
        if (!bookedSlots.includes(i)) {
            availableSlot = i;
            break;
        }
    }

    meeting.time = time;
    meeting.slotNumber = availableSlot;
    await meeting.save();

    return meeting;
};
