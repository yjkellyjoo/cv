---
title: Speech-to-text converter
summary: A transcription tool built for one counsellor who was spending longer writing notes than counselling.
icon: 🗣️
dateStart: 2019-11-01
dateEnd: 2020-01-31
stacks: [GCP, Python, STT]
scale: Small
links:
  - label: Source code
    url: https://github.com/yjkellyjoo/speech_api
---

A Python program that uploads audio to Google Cloud Storage, runs the Cloud Speech-to-Text API over it, and
writes the transcript out as a local text file.

Built for a consultant I know who was writing up counselling sessions by hand — a job that was taking
longer than the sessions themselves.

Data logging is
[disabled](https://cloud.google.com/speech-to-text/docs/data-logging) in the API calls, so session audio
isn't retained by the provider
([terms](https://cloud.google.com/speech-to-text/docs/data-logging-terms)). That mattered more than
anything else here, given what's on the recordings.
