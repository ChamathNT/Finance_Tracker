const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const dbConnect = require('../src/db-config');
const routes = require('./routes/baseRoute');
const { processRecurringTransactions } = require("./utils/recurrenceUtil");


// const processRecurringTransactions = require('./services/transactionService/recuringTransactions');
// const swaggerUi  =require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json') ;

// const cron = require("node-cron");

//initialization and middleware
const app = express();
dotenv.config();
const port = process.env.PORT || 5000;
app.use(cors(['http://localhost:5173/*']));
app.use(express.json({limit: '15mb'}));
app.use(cookieParser());
app.use('/api', routes );




// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// // Start the recurring transactions cron job
// if (!global.isCronJobScheduled) {
//   global.isCronJobScheduled = true;
//   console.log("🕒 Scheduling Daily Cron Job at Midnight (0 0 * * *)");
//   cron.schedule("0 0 * * *", processRecurringTransactions),{
//     timezone:"Asia/Kolkata"
//   };
// }




app.listen(port, () => {
  // console.log(`listening on port ${port} & navigate to http://localhost:${port}/api-docs/ for API documentation`);
  dbConnect();
});

processRecurringTransactions();