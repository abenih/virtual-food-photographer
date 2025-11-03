import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import Button from './Button';
import { LOADING_MESSAGES } from '../constants';

interface GeneratedImageViewerProps {
  images: GeneratedImage[];
  onEditImage: (id: string, imageData: string, mimeType: string, prompt: string) => Promise<void>;
  mimeType: string;
}

const GeneratedImageViewer: React.FC<GeneratedImageViewerProps> = ({ images, onEditImage, mimeType }) => {
  const [editPrompts, setEditPrompts] = useState<Record<string, string>>({});
  const [loadingMessages, setLoadingMessages] = useState<Record<string, string>>({});

  React.useEffect(() => {
    // Initialize editPrompts and loadingMessages when images change
    const initialPrompts: Record<string, string> = {};
    const initialLoadingMessages: Record<string, string> = {};
    images.forEach(img => {
      initialPrompts[img.id] = ''; // Or img.currentPrompt if you want to pre-fill
      initialLoadingMessages[img.id] = '';
    });
    setEditPrompts(initialPrompts);
    setLoadingMessages(initialLoadingMessages);
  }, [images]);

  const handleEditPromptChange = (id: string, value: string) => {
    setEditPrompts(prev => ({ ...prev, [id]: value }));
  };

  const handleEdit = async (image: GeneratedImage) => {
    const prompt = editPrompts[image.id];
    if (!prompt) {
      alert('Please enter an edit prompt.');
      return;
    }

    const intervalId = setInterval(() => {
      setLoadingMessages(prev => ({
        ...prev,
        [image.id]: LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
      }));
    }, 2000); // Change message every 2 seconds

    try {
      await onEditImage(image.id, image.imageUrl, mimeType, prompt);
      setEditPrompts(prev => ({ ...prev, [image.id]: '' })); // Clear prompt after successful edit
    } finally {
      clearInterval(intervalId);
      setLoadingMessages(prev => ({ ...prev, [image.id]: '' }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 mt-8">
      {images.map((image) => (
        <div key={image.id} className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          <h3 className="text-xl font-semibold p-4 border-b border-gray-200 text-gray-800">{image.dishName}</h3>
          <div className="relative flex-grow min-h-[250px] bg-gray-100 flex items-center justify-center">
            {image.isLoading ? (
              <div className="flex flex-col items-center justify-center text-blue-600 text-center p-4">
                <svg className="animate-spin h-10 w-10 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-medium text-lg">{loadingMessages[image.id] || "Generating..."}</p>
                <p className="text-sm text-gray-500 mt-1">Prompt: {image.currentPrompt}</p>
              </div>
            ) : image.error ? (
              <p className="text-red-500 p-4 text-center">Error: {image.error}</p>
            ) : (
              image.imageUrl && (
                <img
                  src={image.imageUrl}
                  alt={image.dishName}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              )
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Original Prompt: <span className="italic">{image.originalPrompt}</span></p>
            <p className="text-sm text-gray-600 mb-4">Current Prompt: <span className="italic">{image.currentPrompt}</span></p>

            <div className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="e.g., 'Add a retro filter' or 'Make it brighter'"
                value={editPrompts[image.id] || ''}
                onChange={(e) => handleEditPromptChange(image.id, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={image.isLoading}
              />
              <Button
                onClick={() => handleEdit(image)}
                isLoading={image.isLoading && loadingMessages[image.id] !== ''}
                disabled={!editPrompts[image.id] || image.isLoading}
                className="w-full"
              >
                Edit Image
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GeneratedImageViewer;
