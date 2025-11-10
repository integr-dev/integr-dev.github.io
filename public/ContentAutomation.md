# Content Automation

## About
Automatically generates clips of a length of around 30 seconds. Fills those clips with Chuck Norris jokes, and jokes
from a joke-api. Uses background Videos in -mp4 format. Adds subtitles automatically. Perfect for platforms like TikTok
and YouTube-shorts.

Everything is done automatically. You just need to provide a list of video files in a folder, and the program will
take care of the rest.

## How it works
1. The program pulls a random input text from a source.
2. The program selects a random video from the input folder.
3. The program uses TTS to generate audio from the input text.
4. The program adds subtitles to the video with openai-whisper in a python script.
5. The program uses FFMPEG to combine the audio, sound and video.
6. The program saves the final video to the output folder.