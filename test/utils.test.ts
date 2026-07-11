import { describe, it, expect } from 'vitest'
import {
  trimFilename,
  generateOutputName,
  truncateFileName,
  getFileExtension,
  getFileSize,
  getEmojiFromType,
  formatTime,
  calculateTimeRemaining,
  formatTimeRemaining,
  parseFFmpegTimeLog,
  parseBitrateFromLog,
  isSizeImproved,
  capitalizeFirstLetter,
} from '../src/utils'

describe('trimFilename', () => {
  it('should trim filename', () => {
    expect(trimFilename('foo.mp4')).toBe('foo')
  })

  it('should trim filename with multiple dots', () => {
    expect(trimFilename('foo.bar.baz.mp4')).toBe('foo.bar.baz')
  })

  it('should return filename if no dot', () => {
    expect(trimFilename('foo')).toBe('foo')
  })

  it('should return empty string for dotfiles starting with a dot', () => {
    expect(trimFilename('.gitignore')).toBe('')
  })
})

describe('generateOutputName', () => {
  it('should generate output name', () => {
    expect(generateOutputName('foo.mp4', 'webm')).toBe('foo_entropy.webm')
  })

  it('should generate output name with multiple dots', () => {
    expect(generateOutputName('foo.bar.baz.mp4', 'webm')).toBe(
      'foo.bar.baz_entropy.webm'
    )
  })
})

describe('getFileExtension', () => {
  it('should return the extension without the dot', () => {
    expect(getFileExtension('foo.mp4')).toBe('mp4')
  })

  it('should return the last extension for filenames with multiple dots', () => {
    expect(getFileExtension('foo.bar.baz.mp4')).toBe('mp4')
  })

  it('should return the whole filename when there is no dot', () => {
    expect(getFileExtension('foo')).toBe('foo')
  })
})

describe('truncateFileName', () => {
  it('should return the filename unchanged if within maxLength', () => {
    expect(truncateFileName('foo.mp4')).toBe('foo.mp4')
  })

  it('should return the filename unchanged when exactly at maxLength', () => {
    const fileName = 'a'.repeat(20) + '.mp4'
    expect(fileName.length).toBe(24)
    expect(truncateFileName(fileName)).toBe(fileName)
  })

  it('should truncate the middle of long filenames and keep the extension', () => {
    const fileName = 'a-very-long-filename-that-exceeds-the-limit.mp4'
    const result = truncateFileName(fileName)
    expect(result.length).toBeLessThan(fileName.length)
    expect(result).toContain('...')
    expect(result.endsWith('.mp4')).toBe(true)
  })

  it('should respect a custom maxLength', () => {
    const fileName = 'a-very-long-filename-that-exceeds-the-limit.mp4'
    expect(truncateFileName(fileName, 10).length).toBeLessThan(
      truncateFileName(fileName, 40).length
    )
  })
})

describe('getFileSize', () => {
  it('should format bytes', () => {
    expect(getFileSize(500)).toBe('500.00 B')
  })

  it('should format kilobytes', () => {
    expect(getFileSize(1024)).toBe('1.00 KB')
  })

  it('should format megabytes', () => {
    expect(getFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB')
  })

  it('should format gigabytes', () => {
    expect(getFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
  })

  it('should format zero bytes', () => {
    expect(getFileSize(0)).toBe('0.00 B')
  })
})

describe('getEmojiFromType', () => {
  it('should return emoji for video', () => {
    expect(getEmojiFromType('video')).toBe('🎥')
  })

  it('should return emoji for audio', () => {
    expect(getEmojiFromType('audio')).toBe('🎵')
  })

  it('should return emoji for image', () => {
    expect(getEmojiFromType('image')).toBe('🖼️')
  })

  it('should return emoji for unknown type', () => {
    expect(getEmojiFromType('foo')).toBe('📁')
  })
})

describe('formatTime', () => {
  it('should format time', () => {
    expect(formatTime(0)).toBe('00:00:00.000')
    expect(formatTime(1)).toBe('00:00:01.000')
    expect(formatTime(60)).toBe('00:01:00.000')
    expect(formatTime(61)).toBe('00:01:01.000')
    expect(formatTime(3600)).toBe('01:00:00.000')
    expect(formatTime(3601)).toBe('01:00:01.000')
    expect(formatTime(3661)).toBe('01:01:01.000')
  })

  it('should format time with milliseconds', () => {
    expect(formatTime(0.5)).toBe('00:00:00.500')
    expect(formatTime(1.123)).toBe('00:00:01.123')
    expect(formatTime(60.127)).toBe('00:01:00.127')
    expect(formatTime(61.123)).toBe('00:01:01.123')
    expect(formatTime(3600.123)).toBe('01:00:00.123')
    expect(formatTime(3601.542)).toBe('01:00:01.542')
    expect(formatTime(3661.999)).toBe('01:01:01.999')
  })

  it('should throw error if time is negative', () => {
    expect(() => formatTime(-1)).toThrow('Time cannot be negative')
  })

  it('should throw error if time is NaN', () => {
    expect(() => formatTime(NaN)).toThrow('Time must be a number')
  })
})

describe('calculateTimeRemaining', () => {
  it('should calculate time remaining', () => {
    expect(calculateTimeRemaining(100, 0, 1)).toBe(100)
    expect(calculateTimeRemaining(100, 50, 1)).toBe(50)
    expect(calculateTimeRemaining(100, 50, 2)).toBe(25)
    expect(calculateTimeRemaining(100, 50, 0.5)).toBe(100)
    expect(calculateTimeRemaining(75, 4.34, 0.3)).toBe(236)
  })

  it('should throw error if total duration is negative', () => {
    expect(() => calculateTimeRemaining(-1, 0, 1)).toThrow(
      'Total duration cannot be negative'
    )
  })

  it('should throw error if total duration is NaN', () => {
    expect(() => calculateTimeRemaining(NaN, 0, 1)).toThrow(
      'Total duration must be a number'
    )
  })

  it('should return 0 if current duration is equal or greater than total duration', () => {
    expect(calculateTimeRemaining(100, 100, 1)).toBe(0)
    expect(calculateTimeRemaining(100, 101, 1)).toBe(0)
    expect(calculateTimeRemaining(100, 999, 1)).toBe(0)
  })
})

describe('formatTimeRemaining', () => {
  it('should format time remaining', () => {
    expect(formatTimeRemaining(0)).toBe('0s')
    expect(formatTimeRemaining(1)).toBe('1s')
    expect(formatTimeRemaining(60)).toBe('1m')
    expect(formatTimeRemaining(61)).toBe('1m 1s')
    expect(formatTimeRemaining(3600)).toBe('1h')
    expect(formatTimeRemaining(3601)).toBe('1h 1s')
    expect(formatTimeRemaining(3661)).toBe('1h 1m 1s')
  })
})

describe('parseFFmpegTimeLog', () => {
  it('should parse ffmpeg time log correctly', () => {
    expect(
      parseFFmpegTimeLog(
        'frame=  138 fps= 90 q=31.0 size=       0kB time=00:00:01.41 bitrate=   0.3kbits/s speed=0.919x'
      )
    ).toEqual({
      time: 1.41,
      speed: 0.919,
    })
    expect(
      parseFFmpegTimeLog(
        'frame=  147 fps= 67 q=-1.0 Lsize=      49kB time=00:00:02.40 bitrate= 167.1kbits/s speed= 1.1x'
      )
    ).toEqual({
      time: 2.4,
      speed: 1.1,
    })
  })

  it('should return null if log message is undefined', () => {
    expect(parseFFmpegTimeLog(undefined)).toBeNull()
  })

  it('should return null if the log has time but no speed', () => {
    expect(
      parseFFmpegTimeLog('frame=  138 fps= 90 time=00:00:01.41 bitrate=0.3kbits/s')
    ).toBeNull()
  })

  it('should return null if the log has speed but no time', () => {
    expect(
      parseFFmpegTimeLog('frame=  138 fps= 90 speed=0.919x')
    ).toBeNull()
  })
})

describe('capitalizeFirstLetter', () => {
  it('should capitalize first letter', () => {
    expect(capitalizeFirstLetter('foo')).toBe('Foo')
  })

  it('should return empty string if input is empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })
})

describe('parseBitrateFromLog', () => {
  it('should parse bitrate from ffmpeg probe output', () => {
    expect(
      parseBitrateFromLog(
        '  Duration: 00:00:30.04, start: 0.000000, bitrate: 1234 kb/s'
      )
    ).toBe(1234)
  })

  it('should return null if no bitrate found', () => {
    expect(
      parseBitrateFromLog(
        'frame=  138 fps= 90 q=31.0 size=       0kB time=00:00:01.41 bitrate=   0.3kbits/s speed=0.919x'
      )
    ).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(parseBitrateFromLog(undefined)).toBeNull()
  })
})

describe('isSizeImproved', () => {
  it('should return true if output is smaller than input', () => {
    expect(isSizeImproved(1000, 500)).toBe(true)
  })

  it('should return false if output is same size as input', () => {
    expect(isSizeImproved(1000, 1000)).toBe(false)
  })

  it('should return false if output is larger than input', () => {
    expect(isSizeImproved(500, 1000)).toBe(false)
  })
})
