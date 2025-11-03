import { PhotographyStyle } from './types';

export const STYLE_PROMPTS: Record<PhotographyStyle, string> = {
  [PhotographyStyle.RUSTIC_DARK]: 'A rustic, dark, moody, professional food photograph',
  [PhotographyStyle.BRIGHT_MODERN]: 'A bright, modern, minimalist, professional food photograph',
  [PhotographyStyle.SOCIAL_MEDIA]: 'A vibrant, top-down, social media style food photograph',
};

export const IMAGEN_MODEL = 'imagen-4.0-generate-001';
export const GEMINI_FLASH_IMAGE_MODEL = 'gemini-2.5-flash-image';

export const INITIAL_MENU_TEXT = `Classic Burger
Margherita Pizza
Caesar Salad
Fish and Chips
Chocolate Lava Cake`;

export const LOADING_MESSAGES = [
  "Prepping the ingredients...",
  "Setting up the perfect lighting...",
  "Composing the shot...",
  "Adding a touch of magic...",
  "Almost ready to serve!",
];
