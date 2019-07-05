#!/bin/bash
# script that build image docker with the param
# example:  . build.sh console
cd "/oasis/$1" && docker build -t $1 .
cd /oasis/