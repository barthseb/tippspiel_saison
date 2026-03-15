/**
 * Calculate points for a tip given the actual result.
 * 3 = exact score
 * 1 = correct outcome (W/D/L), wrong score
 * 0 = wrong outcome
 */
export function calculatePoints(
  homeTip: number,
  awayTip: number,
  homeActual: number,
  awayActual: number
): number {
  if (homeTip === homeActual && awayTip === awayActual) {
    return 3
  }
  const tipOutcome = Math.sign(homeTip - awayTip)
  const actualOutcome = Math.sign(homeActual - awayActual)
  if (tipOutcome === actualOutcome) {
    return 1
  }
  return 0
}
