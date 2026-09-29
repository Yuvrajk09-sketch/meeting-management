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
        
        col.innerHTML = `
            <div class="meeting-card">
                <h5 class="text-info">${meeting.username}</h5>
                <p class="text-light mb-1"><small>${meeting.email}</small></p>
                <div class="d-flex align-items-center mb-3">
                    <span class="badge bg-primary me-2">${meeting.time}</span>
                    <span class="badge bg-secondary">Slot ${meeting.slotNumber}/3</span>
                </div>
                
                <p class="text-light small mt-3">
                    Hi <strong>${meeting.username}</strong>, you have scheduled a meeting on <strong>${meeting.time}</strong> and slot <strong>${meeting.slotNumber}</strong>. Here is your link, click to join:
                </p>
                <a href="${meetLink}" target="_blank" class="meet-link">Join Google Meet</a>
                
                <div class="action-btns">
                    <button class="btn-action btn-edit" onclick="editMeeting(${meeting.id}, '${meeting.username}', '${meeting.email}', '${meeting.time}')">Edit</button>
                    <button class="btn-action btn-delete" onclick="deleteMeeting(${meeting.id})">Cancel</button>
                </div>
            </div>
        `;
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
