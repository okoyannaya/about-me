export enum ICONS {
  MOON = 'moon',
  SUN = 'sun',
  SYSTEM_DARK = 'system-dark',
  SYSTEM_LIGHT = 'system-light',
  SYSTEM = 'system',
}

export const createIconUrl = (icon: ICONS): string => `url("icons/${icon}.svg")`;