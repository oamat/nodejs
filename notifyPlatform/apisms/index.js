/*
 * Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config'); //we need configurations

// Declare the app
const app = require('./server/app');

// Init api server
app.listen(process.env.PORT, () => {
     console.log(process.env.GREEN_COLOR,'The HTTPS server is running on port '+ process.env.PORT);
});