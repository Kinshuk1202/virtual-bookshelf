// Deterministic spine-color palette. Cycled by position, not chosen by the user,
// so a shelf full of books reads as a natural, varied row of spines.
export const PALETTE = [
  '#c98a3a', // amber
  '#a8443c', // brick red
  '#3f7d6b', // teal green
  '#3a6ea5', // slate blue
  '#6b4a8a', // plum
  '#7a8a3f', // olive
  '#8a3f5a', // mulberry
  '#4a4038', // charcoal brown
]

export function colorForIndex(i) {
  return PALETTE[i % PALETTE.length]
}

export function contrastText(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? '#241a10' : '#f2e9d8'
}
