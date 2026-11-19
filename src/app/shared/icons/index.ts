export enum IconName {
  Moon = 'moon',
  Sun = 'sun',
  System = 'system',
  SystemDark = 'system-dark',
  SystemLight = 'system-light',
}

export const createIconUrl = (icon: IconName) => `url("icons/${icon}.svg")`;
