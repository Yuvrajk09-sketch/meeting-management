const API_URL = 'http://localhost:3000/api/meetings';
const meetingForm = document.getElementById('meetingForm');
const messageBox = document.getElementById('messageBox');
const meetingsList = document.getElementById('meetingsList');
const submitBtn = document.getElementById('submitBtn');

document.addEventListener('DOMContentLoaded', fetchMeetings);

meetingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('meetingId').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const time = document.getElementById('time').value;

    const payload = { username, email, time };

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Processing...';
        
        if (id) {
            // Edit existing meeting
            await axios.put(`${API_URL}/${id}`, payload);
            showMessage('Meeting updated successfully!', 'success');
        } else {
            // Create new meeting
            await axios.post(API_URL, payload);
            showMessage('Meeting scheduled successfully!', 'success');
        }
        
        resetForm();
        fetchMeetings();
    } catch (err) {
        console.error(err);
        const errorMsg = err.response && err.response.data && err.response.data.error 
            ? err.response.data.error 
            : 'An error occurred. Please try again.';
        showMessage(errorMsg, 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = id ? 'Update Meeting' : 'Schedule Meeting';
    }
});

async function fetchMeetings() {
    try {
        const response = await axios.get(API_URL);
        renderMeetings(response.data);
    } catch (err) {
        console.error(err);
        showMessage('Failed to load scheduled meetings.', 'danger');
    }
}

function renderMeetings(meetings) {
    meetingsList.innerHTML = '';
    
    if (meetings.length === 0) {
        meetingsList.innerHTML = '<div class="col-12 text-center text-secondary">No meetings scheduled yet.</div>';
        return;
    }

    // Group by time or just list them
    meetings.forEach(meeting => {
        const meetLink = `https://meet.google.com/xyz-abcd-xyz?slot=${meeting.slotNumber}`;
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        // Create the main card container
        const card = document.createElement('div');
        card.className = 'meeting-card';

        // Create the username header
        const nameHeader = document.createElement('h5');
        nameHeader.className = 'text-info';
        nameHeader.textContent = meeting.user.username;
        card.appendChild(nameHeader);

        // Create the email paragraph
        const emailPara = document.createElement('p');
        emailPara.className = 'text-light mb-1';
        const emailSmall = document.createElement('small');
        emailSmall.textContent = meeting.user.email;
        emailPara.appendChild(emailSmall);
        card.appendChild(emailPara);

        // Create the badge container for time and slot
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'd-flex align-items-center mb-3';
        
        const timeBadge = document.createElement('span');
        timeBadge.className = 'badge bg-primary me-2';
        timeBadge.textContent = meeting.time;
        badgeContainer.appendChild(timeBadge);
        
        const slotBadge = document.createElement('span');
        slotBadge.className = 'badge bg-secondary';
        slotBadge.textContent = `Slot ${meeting.slotNumber}/3`;
        badgeContainer.appendChild(slotBadge);
        
        card.appendChild(badgeContainer);

        // Create the meeting message
        const messagePara = document.createElement('p');
        messagePara.className = 'text-light small mt-3';
        // Using innerHTML here just for the bold tags (<strong>), but we could use DOM nodes for those too!
        messagePara.innerHTML = `Hi <strong>${meeting.user.username}</strong>, you have scheduled a meeting on <strong>${meeting.time}</strong> and slot <strong>${meeting.slotNumber}</strong>. Here is your link, click to join:`;
        card.appendChild(messagePara);

        // Create the Google Meet link
        const meetLinkAnchor = document.createElement('a');
        meetLinkAnchor.href = meetLink;
        meetLinkAnchor.target = '_blank';
        meetLinkAnchor.className = 'meet-link';
        meetLinkAnchor.textContent = 'Join Google Meet';
        card.appendChild(meetLinkAnchor);

        // Create the action buttons container
        const actionBtns = document.createElement('div');
        actionBtns.className = 'action-btns';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-action btn-edit';
        editBtn.textContent = 'Edit';
        // Use an event listener instead of the inline 'onclick' attribute
        editBtn.addEventListener('click', () => editMeeting(meeting.id, meeting.user.username, meeting.user.email, meeting.time));
        actionBtns.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-action btn-delete';
        deleteBtn.textContent = 'Cancel';
        deleteBtn.addEventListener('click', () => deleteMeeting(meeting.id));
        actionBtns.appendChild(deleteBtn);

        card.appendChild(actionBtns);
        
        // Finally, append the card to the column
        col.appendChild(card);
        meetingsList.appendChild(col);
    });
}

function editMeeting(id, username, email, time) {
    document.getElementById('meetingId').value = id;
    document.getElementById('username').value = username;
    document.getElementById('email').value = email;
    document.getElementById('time').value = time;
    
    submitBtn.innerText = 'Update Meeting';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteMeeting(id) {
    if (confirm('Are you sure you want to cancel this meeting?')) {
        try {
            await axios.delete(`${API_URL}/${id}`);
            showMessage('Meeting canceled successfully!', 'success');
            fetchMeetings();
        } catch (err) {
            console.error(err);
            showMessage('Failed to cancel meeting.', 'danger');
        }
    }
}

function showMessage(msg, type) {
    const color = type === 'success' ? '#34d399' : '#f87171';
    messageBox.innerHTML = `<div style="color: ${color}; font-weight: 500;">${msg}</div>`;
    
    setTimeout(() => {
        messageBox.innerHTML = '';
    }, 5000);
}

function resetForm() {
    meetingForm.reset();
    document.getElementById('meetingId').value = '';
    submitBtn.innerText = 'Schedule Meeting';
}
