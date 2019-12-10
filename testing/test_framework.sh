#!/bin/bash

command="../halite_nix --no-replay --no-logs -vvv --width 32 --height 32 'node ../ProspectorBot.js' 'node ../archive/MyBot.js' 2>&1"
OUTPUT=$(eval "$command")

ids=$(echo "$OUTPUT" | awk '/was rank [0-9]+ with [0-9]* halite/ {print $3;}' | cut -d , -f1)
names=$(echo "$OUTPUT" | awk '/was rank [0-9]+ with [0-9]* halite/ {print $4;}' | cut -d , -f1)
scores=$(echo "$OUTPUT" | awk '/was rank [0-9]+ with [0-9]* halite/ {print $9;}')

IDS=($ids)
NAMES=($names)
SCORES=($scores)

FIRST_PLAYER=()
FIRST_PLAYER+=(${SCORES[0]})
SECOND_PLAYER=()
SECOND_PLAYER+=(${SCORES[1]})

for i in {1..99}
do
  OUTPUT=$(eval "$command")
  scores=$(echo "$OUTPUT" | awk '/was rank [0-9]+ with [0-9]* halite/ {print $9;}')
  SCORES=($scores)
  FIRST_PLAYER+=(${SCORES[0]})
  SECOND_PLAYER+=(${SCORES[1]})
done

declare -i FIRST_PLAYER_SUM
declare -i SECOND_PLAYER_SUM

for i in {0..99}
do
  FIRST_PLAYER_SUM+=FIRST_PLAYER[i]
  SECOND_PLAYER_SUM+=SECOND_PLAYER[i]
done

FIRST_PLAYER_AVG=$(($FIRST_PLAYER_SUM/100))
SECOND_PLAYER_AVG=$(($SECOND_PLAYER_SUM/100))

echo "The first player ${NAMES[0]} has an average score of ${FIRST_PLAYER_AVG} over 100 runs"
echo "The second player ${NAMES[1]} has an average score of ${SECOND_PLAYER_AVG} over 100 runs"
