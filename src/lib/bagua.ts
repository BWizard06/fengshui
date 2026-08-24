export const baguaAccent = {
  xun: 'var(--color-wood)',
  li: 'var(--color-fire)',
  kun: 'var(--color-earth)',
  zhen: 'var(--color-wood)',
  taiji: 'var(--color-earth)',
  dui: 'var(--color-metal)',
  gen: 'var(--color-earth)',
  kan: 'var(--color-water)',
  qian: 'var(--color-metal)',
} as const;

export const baguaAccentHex = {
  xun: '#6E7F5A',
  li: '#B0553C',
  kun: '#B58A4C',
  zhen: '#6E7F5A',
  taiji: '#B58A4C',
  dui: '#7C8488',
  gen: '#B58A4C',
  kan: '#4C6E8A',
  qian: '#7C8488',
} as const;

export type BaguaKey = keyof typeof baguaAccentHex;
