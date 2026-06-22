export interface TerritoryColor {
  hex: string
  label: string
}

export const TERRITORY_COLORS: TerritoryColor[] = [
  { hex: '#2F2D30', label: '차콜' },
  { hex: '#CFBB7B', label: '골드' },
  { hex: '#2B2E43', label: '네이비' },
  { hex: '#5A4743', label: '브라운' },
  { hex: '#6CABDD', label: '시티' },
  { hex: '#4B6D41', label: '포레스트' },
  { hex: '#77202E', label: '버건디' },
  { hex: '#B5BAB6', label: '실버' },
  { hex: '#0074A8', label: '블루' },
  { hex: '#6F6C70', label: '그레이' },
  { hex: '#D56231', label: '테라코타' },
]

export const DEFAULT_TERRITORY_COLOR_HEX = '#33BECC'
