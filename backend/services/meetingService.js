const { Meeting, User } = require('../models');

exports.getAllMeetings = async () => {
    return await Meeting.findAll({
        include: User
    });
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

    // Find or create the user based on email
    const [user] = await User.findOrCreate({
        where: { email },
        defaults: { username }
    });

    // Create meeting and link to user
    const newMeeting = await Meeting.create({
        time,
        slotNumber: availableSlot,
        userId: user.id
    });

    // Return the meeting with the user included so the frontend has the data it expects
    return await Meeting.findByPk(newMeeting.id, { include: User });
};

exports.cancelMeeting = async (id) => {
    const result = await Meeting.destroy({ where: { id } });
    if (!result) {
        throw new Error('Meeting not found');
    }
    return result;
};

exports.editMeeting = async (id, time) => {
    const meeting = await Meeting.findByPk(id, { include: User });
    if (!meeting) {
        throw new Error('Meeting not found');
    }

    if (meeting.time === time) {
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
