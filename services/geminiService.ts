import { GoogleGenAI, GenerateContentResponse, Modality } from '@google/genai';
import { IMAGEN_MODEL, GEMINI_FLASH_IMAGE_MODEL } from '../constants';

/**
 * Initializes the GoogleGenAI client with the API key from environment variables.
 * A new instance is created on each call to ensure it uses the latest API key if it were to change.
 */
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a food image based on the dish name and photography style.
 * @param dishName The name of the dish.
 * @param stylePrompt The base prompt string for the photography style.
 * @returns A base64 encoded image URL.
 */
export const generateFoodImage = async (
  dishName: string,
  stylePrompt: string,
): Promise<string> => {
  const ai = getGeminiClient();
  const prompt = `${stylePrompt} of a delicious ${dishName}. Focus on appetizing presentation and high quality.`;

  try {
    const response = await ai.models.generateImages({
      model: IMAGEN_MODEL,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1', // Standard aspect ratio for food
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images were generated.');
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(`Failed to generate image for "${dishName}": ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Edits an existing image using a text prompt.
 * @param base64ImageData The base64 encoded string of the image to edit.
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg', 'image/png').
 * @param editPrompt The text prompt for editing the image.
 * @returns A base64 encoded image URL of the edited image.
 */
export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  editPrompt: string,
): Promise<string> => {
  const ai = getGeminiClient();

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_FLASH_IMAGE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData.split(',')[1], // Remove the "data:image/jpeg;base64," prefix
              mimeType: mimeType,
            },
          },
          {
            text: editPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content?.parts) {
        throw new Error('No content received from image editing.');
    }

    const imagePart = response.candidates[0].content.parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));

    if (imagePart?.inlineData) {
      const editedBase64ImageBytes: string = imagePart.inlineData.data;
      return `data:${imagePart.inlineData.mimeType};base64,${editedBase64ImageBytes}`;
    } else {
      throw new Error('No image data found in the edited response.');
    }
  } catch (error) {
    console.error('Error editing image:', error);
    throw new Error(`Failed to edit image: ${error instanceof Error ? error.message : String(error)}`);
  }
};
