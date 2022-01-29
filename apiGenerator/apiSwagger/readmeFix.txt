If you get the follow error after type $ swagger project start:

    Error initializing middleware
    Error: Cannot find module '/home/tom/tutorials/hello-world/api/fittings/swagger_router'
    Require stack:
    - /home/tom/tutorials/hello-world/node_modules/bagpipes/lib/fittingTypes/user.js
    - /home/tom/tutorials/hello-world/node_modules/bagpipes/lib/bagpipes.js
    - /home/tom/tutorials/hello-world/node_modules/bagpipes/lib/index.js
    - /home/tom/tutorials/hello-world/node_modules/swagger-node-runner/index.js
    - /home/tom/tutorials/hello-world/node_modules/swagger-express-mw/lib/index.js
    - /home/tom/tutorials/hello-world/app.js
    ...

Problem is that in Node Not Found error differs from Node 10. bagpipes relies on error message text. This can tepmorary be fixed in this file: node_modules/bagpipes/lib/fittingTypes/user.js file:
var split = err.message.split(path.sep);
should be
var split = err.message.split('\n')[0].split(path.sep);