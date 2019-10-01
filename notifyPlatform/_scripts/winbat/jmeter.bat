@echo off
cd ..\..\..\..\..\apache-jmeter-5.1.1\bin
start cmd /k .\jmeter.bat  -n -t C:\Users\Oriol\Downloads\nodejs\nodejs\notifyPlatform\_performance\jmeter.jmx 
cd ..\..\nodejs\nodejs\notifyPlatform\_scripts\winbat\