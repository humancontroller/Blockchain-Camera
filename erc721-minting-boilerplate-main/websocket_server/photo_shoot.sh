#!/bin/bash

raspistill -t 1 -n -w 300 -h 300 -rot 180 -ex auto -o ./$1

killall matchbox-keyboard
