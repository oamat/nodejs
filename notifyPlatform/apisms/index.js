/*
 * Primary file for API
 *
 */

"use strict";

// Dependencies
require('./config/config');
var port = process.env.PORT;

// Declare the app
const app = require('./server/app');

// Init api server
app.listen(port, () => {
     console.log(process.env.GREEN_COLOR,'The HTTPS server is running on port '+ port);
});