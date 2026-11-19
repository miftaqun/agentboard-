#!/bin/bash
# assemble-demo.sh <midshot> — build the ±60s AgentBoard demo video.
# <midshot> = shot-3-notes.png (if check-ins loaded) or shot-5-identity.png (fallback).
set -euo pipefail
cd "$(dirname "$0")/.."
MID="${1:-shot-3-notes.png}"
F=demo/frames
SEG=demo/segments
mkdir -p "$SEG" demo
rm -f "$SEG"/*.mp4

seg_card() { # name file dur
  ffmpeg -v error -loop 1 -i "$F/$2" -t "$3" \
    -vf "scale=1280:720,format=yuv420p" -r 30 -c:v libx264 -preset medium -crf 20 "$SEG/$1.mp4"
}
seg_shot() { # name file dur  (slow zoom-in)
  local frames=$(( $3 * 30 ))
  ffmpeg -v error -i "$F/$2" \
    -vf "scale=2560:1440,zoompan=z='min(1+0.00045*on,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1280x720:fps=30,format=yuv420p" \
    -t "$3" -c:v libx264 -preset medium -crf 20 "$SEG/$1.mp4"
}

seg_card 01 card-a.png 5
seg_shot 02 shot-1-top.png 8
seg_card 03 card-b.png 5
seg_shot 04 shot-2-checkin.png 8
seg_card 05 card-c.png 5
seg_shot 06 shot-4-contract.png 8
seg_card 07 card-d.png 5
seg_shot 08 shot-6-github.png 8
seg_card 09 card-e.png 8

( cd "$SEG" && ls *.mp4 | sort | sed 's/^/file /' > list.txt )
ffmpeg -v error -f concat -safe 0 -i "$SEG/list.txt" -c copy demo/joined.mp4

# soft ambient pad (A-major chord, very low volume, fades)
ffmpeg -v error -f lavfi -i "sine=frequency=220:duration=60" \
  -f lavfi -i "sine=frequency=277.18:duration=60" \
  -f lavfi -i "sine=frequency=329.63:duration=60" \
  -filter_complex "[0][1][2]amix=inputs=3:normalize=0,volume=0.045,afade=t=in:st=0:d=2,afade=t=out:st=55:d=5" \
  -c:a aac demo/music.m4a

ffmpeg -v error -i demo/joined.mp4 -i demo/music.m4a -c:v copy -c:a aac -movflags +faststart -shortest demo/agentboard-demo.mp4
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 demo/agentboard-demo.mp4
echo "BUILT demo/agentboard-demo.mp4 (midshot: $MID)"
