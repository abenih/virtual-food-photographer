import React, { useState } from 'react';
import Button from './Button';

interface MenuUploadProps {
  onMenuParsed: (menuItems: string[]) => void;
  isLoading: boolean;
}

const MenuUpload: React.FC<MenuUploadProps> = ({ onMenuParsed, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const uploadedFile = event.target.files[0];
      if (uploadedFile.type === 'text/plain') {
        setFile(uploadedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Please upload a .txt file.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const menuItems = text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
      onMenuParsed(menuItems);
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md md:w-1/2 lg:w-1/3 mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Your Menu</h2>
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100 mb-4"
        disabled={isLoading}
      />
      {file && <p className="text-gray-600 mb-4">Selected: {file.name}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button onClick={handleUpload} isLoading={isLoading} disabled={!file || isLoading}>
        Process Menu
      </Button>
      <p className="text-sm text-gray-500 mt-4">
        Please upload a plain text file (.txt) with one menu item per line.
      </p>
    </div>
  );
};

export default MenuUpload;
