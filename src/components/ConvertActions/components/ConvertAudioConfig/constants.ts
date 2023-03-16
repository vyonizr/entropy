type TAudioExtensionOptions = {
  label: string
  audioMethod: string
  value: string
}

export const AUDIO_EXTENSION_OPTIONS: TAudioExtensionOptions[] = [
  {
    label: 'MP3',
    audioMethod: '-c:a libmp3lame -b:a 192k -ar 44100',
    value: 'mp3',
  },
  {
    label: 'AAC',
    audioMethod: '-c:a aac -b:a 192k',
    value: 'aac',
  },
  {
    label: 'OGG',
    audioMethod: '-c:a libvorbis -q:a 5',
    value: 'ogg',
  },
  {
    label: 'WMA',
    audioMethod: '-c:a wmav2 -b:a 192k',
    value: 'wma',
  },
  {
    label: 'WAV',
    audioMethod: '-c:a pcm_s16le -ar 44100',
    value: 'wav',
  },
  {
    label: 'FLAC',
    audioMethod: '-c:a flac -compression_level 5',
    value: 'flac',
  },
  {
    label: 'AIFF',
    audioMethod: '-c:a pcm_s16le -ar 44100',
    value: 'aiff',
  },
  {
    label: 'ALAC',
    audioMethod: '-c:a alac',
    value: 'alac',
  },
]
