const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const meetingRoutes = require('./routes/meetingRoutes');
const { sequelize } = require('./models'); 

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/meetings', meetingRoutes);

const PORT = 3000;


sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log(err);
    });
