export enum PhotographyStyle {
  RUSTIC_DARK = 'Rustic/Dark',
  BRIGHT_MODERN = 'Bright/Modern',
  SOCIAL_MEDIA = 'Social Media (top-down)',
}

export interface Dish {
  id: string;
  name: string;
}

export interface GeneratedImage {
  id: string;
  dishName: string;
  originalPrompt: string;
  currentPrompt: string;
  imageUrl: string; // Base64 image data URL
  isLoading: boolean;
  error?: string;
}
