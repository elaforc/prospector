#!/bin/sh

./halite_nix --replay-directory replays/ -vvv --width 32 --height 32 "node ProspectorBot.js" "node archive/MyBot.js"
