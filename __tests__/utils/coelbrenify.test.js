import { describe, it, expect } from 'vitest'
import coelbrenify from '../../src/utils/coelbrenify'

describe('coelbrenify', () => {
  it('converts lowercase letters to Unicode characters', () => {
    const result = coelbrenify('hello')
    expect(result).toBe('\uE027\uE033\uE022\uE022\uE009')
  })

  it('converts uppercase letters to lowercase then Unicode', () => {
    const result = coelbrenify('HELLO')
    expect(result).toBe('\uE027\uE033\uE022\uE022\uE009')
  })

  it('preserves non-alphabetic characters', () => {
    const result = coelbrenify('hello world!')
    expect(result).toBe('\uE027\uE033\uE022\uE022\uE009 \uE03F\uE009\uE026\uE022\uE01F!')
  })

  it('handles empty string', () => {
    const result = coelbrenify('')
    expect(result).toBe('')
  })

  it('preserves numbers', () => {
    const result = coelbrenify('abc123')
    expect(result).toBe('\uE001\uE00D\uE016123')
  })

  it('preserves special characters', () => {
    const result = coelbrenify('hello@world.com')
    expect(result).toContain('@')
    expect(result).toContain('.')
    expect(result.startsWith('\uE027')).toBe(true) // starts with 'h'
  })

  it('converts all letters of the alphabet correctly', () => {
    const result = coelbrenify('abcdefghijklmnopqrstuvwxyz')
    expect(result).toBe(
      '\uE001\uE00D\uE016\uE01F\uE033\uE015\uE02F\uE027\uE005\uE003\uE017\uE022\uE038\uE021\uE009\uE012\uE030\uE026\uE03B\uE01B\uE03D\uE00B\uE03F\uE031\uE040\uE03B'
    )
  })

  it('handles mixed case input', () => {
    const result = coelbrenify('HeLLo WoRLd')
    expect(result).toBe('\uE027\uE033\uE022\uE022\uE009 \uE03F\uE009\uE026\uE022\uE01F')
  })
})
