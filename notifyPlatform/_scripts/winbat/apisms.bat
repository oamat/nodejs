@echo off
cd ..\..\apis\apisms\
start cmd /k node --max-old-space-size=6000 index.js
cd ..\..\_scripts\winbat\
