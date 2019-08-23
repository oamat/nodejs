#!/bin/bash
# script that build image docker with the param
# example:  . build.sh console
cd "/notifyPlatform/$1" && docker build -t $1 .
cd /notifyPlatform/