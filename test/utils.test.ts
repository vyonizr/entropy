import { describe, it, expect } from 'vitest'
import {
  trimFilename,
  generateOutputName,
  getEmojiFromType,
  formatTime,
  calculateTimeRemaining,
  formatTimeRemaining,
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
