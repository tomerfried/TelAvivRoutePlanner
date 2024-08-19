const express = require('express');
const achuzotHachofScraperController = require('./controllers/achuzotHachofScraperController');
const cors=require("cors");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use('/api', achuzotHachofScraperController);


const corsOptions ={
    origin:'*',
    optionSuccessStatus:200,
}

app.use(cors(corsOptions))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
