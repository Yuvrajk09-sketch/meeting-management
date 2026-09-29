const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const meetingRoutes = require('./routes/meetingRoutes');
const { sequelize } = require('./models'); // Imports from models/index.js

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/meetings', meetingRoutes);

const PORT = 3000;

// force: true is used to drop the old tables and recreate them 
// since we completely changed the schema.
sequelize.sync({ force: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log(err);
    });
