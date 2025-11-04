'use client';

import { useState, useEffect } from 'react';
import { savePageUtils } from '@/lib/savePageUtils';
import Image from 'next/image';

interface SaveButtonProps {
  className?: string;
  pageData?: {
    id?: string;
    title?: string;
    url?: string;
    description?: string;
  };
}

export default function SaveButton({ className = "", pageData }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if current page is saved
    setIsSaved(savePageUtils.isPageSaved(pageData?.id));
  }, [pageData?.id]);

  const handleToggleSave = async () => {
    setIsLoading(true);
    
    try {
      const newSavedState = savePageUtils.toggleSave(pageData);
      setIsSaved(newSavedState);
      
      // Show a brief feedback
      if (newSavedState) {
        console.log('Page saved successfully');
      } else {
        console.log('Page removed from saved');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors ${className} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      title={isSaved ? 'Remove from saved' : 'Save for later'}
    >
      {isSaved ? (
        // Filled bookmark icon for saved state
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ) : (
        // Use the save.svg icon for unsaved state
        <Image height={20} width={20} src="/save.svg" alt="Save" />
      )}
    </button>
  );
}