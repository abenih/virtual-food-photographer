import React from 'react';
import { PhotographyStyle } from '../types';
import { STYLE_PROMPTS } from '../constants';

interface StyleSelectorProps {
  selectedStyle: PhotographyStyle;
  onSelectStyle: (style: PhotographyStyle) => void;
  disabled?: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelectStyle, disabled }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md md:w-1/2 lg:w-1/3 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Choose Photography Style</h2>
      <div className="flex flex-col space-y-3">
        {Object.values(PhotographyStyle).map((style) => (
          <label key={style} className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200
            ${selectedStyle === style ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            <input
              type="radio"
              name="photographyStyle"
              value={style}
              checked={selectedStyle === style}
              onChange={() => onSelectStyle(style)}
              className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-3 text-lg font-medium">{style}</span>
            <span className="ml-auto text-sm text-gray-500">
              {STYLE_PROMPTS[style].split(', ')[0]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
