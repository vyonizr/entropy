import { describe, it, expect } from 'vitest'
import { trimFilename, generateOutputName } from '../src/utils'

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
