export enum Language {
  Russian = 'ru',
  English = 'en',
}

export interface LanguagePreference {
  readonly tag: string;
  readonly quality: number;
}