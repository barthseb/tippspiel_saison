import { describe, it, expect } from 'vitest'
import { calculatePoints } from './scoring'

describe('calculatePoints', () => {
  it('2:1 tip, 2:1 actual → 3 (exact)', () => {
    expect(calculatePoints(2, 1, 2, 1)).toBe(3)
  })

  it('3:1 tip, 2:1 actual → 1 (correct winner, wrong score)', () => {
    expect(calculatePoints(3, 1, 2, 1)).toBe(1)
  })

  it('1:1 tip, 2:1 actual → 0 (predicted draw, home won)', () => {
    expect(calculatePoints(1, 1, 2, 1)).toBe(0)
  })

  it('0:0 tip, 0:0 actual → 3 (exact draw)', () => {
    expect(calculatePoints(0, 0, 0, 0)).toBe(3)
  })

  it('1:1 tip, 0:0 actual → 1 (correct draw, wrong score)', () => {
    expect(calculatePoints(1, 1, 0, 0)).toBe(1)
  })

  it('1:0 tip, 0:0 actual → 0 (predicted home win, was draw)', () => {
    expect(calculatePoints(1, 0, 0, 0)).toBe(0)
  })

  it('0:2 tip, 1:3 actual → 1 (correct away win, wrong score)', () => {
    expect(calculatePoints(0, 2, 1, 3)).toBe(1)
  })
})
