export function isAfterSunset(): boolean {
  const now = new Date()
  const hour = now.getHours()

  // Approximate sunset times throughout the year
  const month = now.getMonth()
  let sunsetHour

  if (month >= 2 && month <= 4) {
    // Spring
    sunsetHour = 19
  } else if (month >= 5 && month <= 7) {
    // Summer
    sunsetHour = 20
  } else if (month >= 8 && month <= 10) {
    // Fall
    sunsetHour = 18
  } else {
    // Winter
    sunsetHour = 17
  }

  return hour >= sunsetHour || hour < 6 // Consider before 6 AM as night as well
}
