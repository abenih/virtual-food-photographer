import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { PhotographyStyle, Dish, GeneratedImage } from './types';
import { STYLE_PROMPTS, INITIAL_MENU_TEXT, LOADING_MESSAGES } from './constants';
import { generateFoodImage, editImage } from './services/geminiService';

import MenuUpload from './components/MenuUpload';
import StyleSelector from './components/StyleSelector';
import GeneratedImageViewer from './components/GeneratedImageViewer';
import Button from './components/Button';

const App: React.FC = () => {
  const [menuItems, setMenuItems] = useState<Dish[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotographyStyle>(PhotographyStyle.BRIGHT_MODERN);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>(''); // For global loading message
  const [isMenuUploaded, setIsMenuUploaded] = useState<boolean>(false); // Track if menu is uploaded

  // Callback for when the menu file is parsed
  const handleMenuParsed = useCallback((items: string[]) => {
    setGlobalError(null);
    setMenuItems(items.map(item => ({ id: uuidv4(), name: item })));
    setGeneratedImages([]); // Clear previous images
    setIsMenuUploaded(true);
  }, []);

  // Function to generate images for all menu items
  const handleGenerateImages = useCallback(async () => {
    if (menuItems.length === 0) {
      setGlobalError('Please upload a menu first.');
      return;
    }
    setGlobalError(null);
    setIsGenerating(true);
    setGeneratedImages([]); // Clear previous images
    const newImages: GeneratedImage[] = [];

    const stylePromptPrefix = STYLE_PROMPTS[selectedStyle];

    const intervalId = setInterval(() => {
      setGenerationProgress(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 2000); // Change message every 2 seconds

    try {
      for (const dish of menuItems) {
        setGeneratedImages(prev => [
          ...prev,
          {
            id: dish.id,
            dishName: dish.name,
            originalPrompt: `${stylePromptPrefix} of a delicious ${dish.name}`,
            currentPrompt: `${stylePromptPrefix} of a delicious ${dish.name}`,
            imageUrl: '', // Placeholder until generated
            isLoading: true,
            error: undefined,
          },
        ]);

        try {
          // Update the specific image's loading state and message
          setGeneratedImages(prev =>
            prev.map(img =>
              img.id === dish.id ? { ...img, isLoading: true, error: undefined } : img
            )
          );

          const imageUrl = await generateFoodImage(dish.name, stylePromptPrefix);
          setGeneratedImages(prev =>
            prev.map(img =>
              img.id === dish.id
                ? { ...img, imageUrl: imageUrl, isLoading: false, error: undefined }
                : img
            )
          );
        } catch (error) {
          console.error(`Error generating image for ${dish.name}:`, error);
          setGeneratedImages(prev =>
            prev.map(img =>
              img.id === dish.id
                ? { ...img, isLoading: false, error: (error instanceof Error ? error.message : String(error)) }
                : img
            )
          );
          setGlobalError(`Failed to generate image for "${dish.name}". Please check the console for details.`);
        }
      }
    } finally {
      clearInterval(intervalId);
      setGenerationProgress('');
      setIsGenerating(false);
    }
  }, [menuItems, selectedStyle]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Function to edit a specific image
  const handleEditImage = useCallback(async (
    id: string,
    imageData: string,
    mimeType: string,
    prompt: string,
  ): Promise<void> => {
    setGlobalError(null);
    setGeneratedImages(prevImages =>
      prevImages.map(img => (img.id === id ? { ...img, isLoading: true, error: undefined } : img))
    );

    try {
      const editedImageUrl = await editImage(imageData, mimeType, prompt);
      setGeneratedImages(prevImages =>
        prevImages.map(img =>
          img.id === id ? { ...img, imageUrl: editedImageUrl, currentPrompt: prompt, isLoading: false } : img
        )
      );
    } catch (error) {
      console.error(`Error editing image ${id}:`, error);
      setGeneratedImages(prevImages =>
        prevImages.map(img =>
          img.id === id ? { ...img, isLoading: false, error: (error instanceof Error ? error.message : String(error)) } : img
        )
      );
      setGlobalError(`Failed to edit image for "${generatedImages.find(img => img.id === id)?.dishName || 'unknown dish'}".`);
    }
  }, [generatedImages]);

  // Initial menu setup
  React.useEffect(() => {
    handleMenuParsed(INITIAL_MENU_TEXT.split('\n').map(item => item.trim()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-extrabold text-blue-800 mb-8 drop-shadow-lg text-center">
        Virtual Food Photographer
      </h1>

      <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl">
        Upload your menu, choose a photography style, and let AI generate stunning, high-end food photos for each dish. You can then edit them with simple text prompts!
      </p>

      {globalError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-md w-full" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{globalError}</span>
        </div>
      )}

      {/* Menu Upload Section */}
      <MenuUpload onMenuParsed={handleMenuParsed} isLoading={isGenerating} />

      {/* Style Selector Section */}
      {isMenuUploaded && (
        <div className="w-full flex justify-center">
          <StyleSelector
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            disabled={isGenerating}
          />
        </div>
      )}

      {/* Generate Button Section */}
      {isMenuUploaded && menuItems.length > 0 && (
        <div className="mt-8 flex flex-col items-center">
          <Button
            onClick={handleGenerateImages}
            isLoading={isGenerating}
            disabled={isGenerating || menuItems.length === 0}
            className="md:w-auto min-w-[200px]"
          >
            {isGenerating ? generationProgress || 'Generating Images...' : `Generate ${menuItems.length} Images`}
          </Button>
          {isGenerating && (
            <p className="mt-4 text-blue-600 text-md animate-pulse">
              This might take a moment. Please wait...
            </p>
          )}
        </div>
      )}

      {/* Generated Images Viewer */}
      {generatedImages.length > 0 && (
        <>
          <h2 className="text-4xl font-bold text-gray-800 mt-16 mb-8 text-center">Your Food Photos</h2>
          <GeneratedImageViewer
            images={generatedImages}
            onEditImage={handleEditImage}
            mimeType="image/jpeg" // Assuming initial generation is JPEG
          />
        </>
      )}

      {/* Sticky footer for persistent CTA or info if needed, but not strictly required by prompt */}
      <footer className="w-full text-center text-gray-500 text-sm mt-20 p-4">
        Powered by Gemini AI
      </footer>
    </div>
  );
};

export default App;
