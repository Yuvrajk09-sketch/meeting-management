# Meeting Management System - Project Theory

Here is a detailed, end-to-end breakdown of the meeting management program. You can use this theory to confidently explain the project's architecture, data flow, and logic in an interview.

---

## 1. Overall Architecture
This is a **Full-Stack Web Application** that follows a modern layered architecture. 
* **Frontend (Client-side):** Built with pure HTML, CSS, and Vanilla JavaScript. It makes asynchronous HTTP requests using the `axios` library.
* **Backend (Server-side):** Built with **Node.js** and the **Express.js** framework to serve a RESTful API.
* **Database:** It uses a SQL database (like MySQL or PostgreSQL), managed through the **Sequelize ORM (Object-Relational Mapper)**, which allows you to interact with the database using JavaScript objects instead of raw SQL queries.

The backend is strictly divided into **Routes, Controllers, Services, and Models** (a variation of MVC), which is an excellent industry best practice for separation of concerns.

---

## 2. The Backend (Node.js & Express)

### A. Entry Point (`server.js`)
This is where the server starts. 
* It initializes the Express application.
* It uses middleware like `cors` (Cross-Origin Resource Sharing) so your frontend running on a different port can talk to it, and `body-parser` to automatically parse incoming JSON requests.
* It defines the base route (`/api/meetings`) and points it to the routing file.
* Finally, it connects to the database via `sequelize.sync()` (which creates tables if they don't exist) and starts listening on port 3000.

### B. The Database Models (`models/index.js`, `models/meeting.js`, `models/user.js`)
The application has a **One-to-Many relational schema**:
* **User Model:** Has fields for `username` and `email`.
* **Meeting Model:** Has fields for `time` (e.g., "2:00 PM") and a `slotNumber` (an integer, either 1, 2, or 3). 
* **Associations:** `index.js` defines that a `User.hasMany(Meeting)` and a `Meeting.belongsTo(User)`. This automatically creates a Foreign Key (`userId`) in the Meetings table.

### C. Controllers (`controllers/meetingController.js`)
The controller's **only job** is to handle the HTTP Request and Response cycle. 
* It receives data from the frontend (like `req.body` for form data or `req.params.id` for URLs).
* It passes that data to the **Service** layer.
* It waits for the service to finish, and then sends back an HTTP status code (like `200 OK`, `201 Created`, or `400/500 Error`) and the resulting JSON data.

### D. Services (`services/meetingService.js`)
This is where the actual **Business Logic** lives. By keeping this out of the controller, your code is much more testable and reusable.
* **The "Slot" Logic (`scheduleMeeting`):** When a user schedules a meeting, the service queries the database to find all existing meetings for that specific `time`. 
  * If there are 3 meetings already, it throws an error (`All 3 slots are booked`).
  * If there is space, it maps over the existing meetings to find which slots (1, 2, or 3) are taken (`const bookedSlots = ...`), loops through numbers 1 to 3, and assigns the first `availableSlot` it finds.
* It also uses Sequelize's `findOrCreate` method to efficiently check if the user's email already exists in the database. If they don't exist, it creates them before linking them to the new meeting.

---

## 3. The Frontend (Vanilla JavaScript)

### A. Logic & State Management (`frontend/main.js`)
The frontend acts as an SPA (Single Page Application). It doesn't reload the page; it dynamically fetches data and updates the DOM.
* **On Load:** As soon as the DOM loads, it fires `fetchMeetings()` which hits the backend `GET /api/meetings` endpoint and retrieves all bookings.
* **Form Submission:** When the user clicks submit, it checks if a hidden `meetingId` field has a value.
  * If `meetingId` is empty, it makes a `POST` request to create a new meeting.
  * If `meetingId` has a value (meaning the user clicked "Edit" previously), it makes a `PUT` request to update the existing record.
* **Dynamic DOM Manipulation:** Inside `renderMeetings()`, instead of just inserting a giant string of raw HTML (which can be vulnerable to Cross-Site Scripting / XSS attacks), the code safely creates individual HTML elements (`document.createElement('div')`), adds classes, attaches event listeners to buttons (`editBtn.addEventListener(...)`), and appends them to the page.

---

## 4. Key Optimizations & Edge Cases Handled
During development, several critical edge cases and performance bottlenecks were addressed to make the application production-ready:
* **Duplicate Booking Prevention:** The scheduling and editing logic enforces strict rules to prevent a single user (identified by email) from booking more than one meeting at the exact same time.
* **Database Connection Speed:** The database host was explicitly set to the IPv4 address (`127.0.0.1`) instead of `localhost`. This is a common industry trick that bypasses the operating system's attempt to resolve `localhost` via IPv6 first, completely eliminating startup connection delays.
* **Robust ORM Updates:** When updating a meeting (e.g., changing time, name, or email), the Service layer explicitly fetches the associated User using `User.findByPk(meeting.userId)`. This explicit fetching is a best practice that is much safer than relying on nested eager-loaded objects (like `meeting.user`), avoiding unpredictable `undefined` errors during complex updates.

---

## 5. How to Frame This in an Interview
If an interviewer asks you to explain the project, you can use the following script:

> *"This is a full-stack RESTful application built with Node.js, Express, and Sequelize for the backend, and Vanilla JavaScript on the frontend. I chose a layered architecture—separating Routes, Controllers, and Services—to ensure the business logic is decoupled from the HTTP routing, making it highly testable and scalable.* 
> 
> *The core feature is a slot-booking algorithm. When a user requests a meeting time, the Service layer queries the database. It first checks for duplicate bookings by the same user to prevent overlap. If they are clear, and if there are fewer than 3 total meetings for that hour, it calculates the next available slot (1, 2, or 3). It ensures the user exists using a 'findOrCreate' method and maps the foreign keys automatically using Sequelize. I also optimized the database connection by bypassing IPv6 resolution delays, and built a robust edit system that safely fetches relationships and recalculates slot availability dynamically when a meeting time is changed. On the frontend, everything is rendered dynamically via Axios calls to ensure a smooth, page-reload-free user experience."*
