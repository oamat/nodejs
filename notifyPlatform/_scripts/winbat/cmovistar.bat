@echo off
cd ..\..\collectors\sms\movistar\
start cmd /k node --max-old-space-size=6000 app.js
cd ..\..\..\_scripts\winbat\
