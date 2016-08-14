const express = require('express');

const model = require('./lib/model');
const applyMiddleware = require('./lib/applyMiddleware');
const mainRouter = require('./router/mainRouter');

const app = express();
applyMiddleware(app);
app.use('/', mainRouter);

app.listen(process.env.PORT || 9004, '0.0.0.0');
