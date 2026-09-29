const { Meeting, User } = require('../models');

exports.getAllMeetings = async () => {
    return await Meeting.findAll({
        include: User
    });
};

exports.scheduleMeeting = async (username, email, time) => {
    const [user] = await User.findOrCreate({
        where: { email },
        defaults: { username }
    });

    if (user.username !== username) {
        user.username = username;
        await user.save();
    }

    const userMeeting = await Meeting.findOne({ where: { time, userId: user.id } });
    if (userMeeting) {
        throw new Error('You have already booked a meeting for this time slot.');
    }

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

    const newMeeting = await Meeting.create({
        time,
        slotNumber: availableSlot,
        userId: user.id
    });

    return await Meeting.findByPk(newMeeting.id, { include: User });
};

exports.cancelMeeting = async (id) => {
    const result = await Meeting.destroy({ where: { id } });
    if (!result) {
        throw new Error('Meeting not found');
    }
    return result;
};

exports.editMeeting = async (id, time, username, email) => {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
        throw new Error('Meeting not found');
    }

    const [targetUser] = await User.findOrCreate({
        where: { email },
        defaults: { username }
    });
    
    if (targetUser.username !== username) {
        targetUser.username = username;
        await targetUser.save();
    }

    if (meeting.time === time && meeting.userId === targetUser.id) {
         return await Meeting.findByPk(id, { include: User });
    }

    const existingUserMeeting = await Meeting.findOne({ where: { time, userId: targetUser.id } });
    if (existingUserMeeting && existingUserMeeting.id !== meeting.id) {
        throw new Error('You have already booked a meeting for this time slot.');
    }

    if (meeting.time !== time) {
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
    }

    meeting.userId = targetUser.id;
    await meeting.save();

    return await Meeting.findByPk(id, { include: User });
};
