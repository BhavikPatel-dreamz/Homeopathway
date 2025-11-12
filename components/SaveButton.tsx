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
   <svg
           width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          fill="#E69E29"
       >
    <path
     d="M4.16634 1.66667H15.833C16.054 1.66667 16.266 1.75447 16.4223 1.91075C16.5785 2.06703 16.6663 2.27899 16.6663 2.50001V18.3333L9.99967 14.5833L3.33301 18.3333V2.50001C3.33301 2.27899 3.42081 2.06703 3.57709 1.91075C3.73337 1.75447 3.94533 1.66667 4.16634 1.66667Z"
      fill="#E69E29"
  />
   </svg>
      ) : (
        // Use the save.svg icon for unsaved state
       <svg
         width="20"
         height="20"
         viewBox="0 0 20 20"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
       >
         <path
           d="M4.16634 1.66667H15.833C16.054 1.66667 16.266 1.75447 16.4223 1.91075C16.5785 2.06703 16.6663 2.27899 16.6663 2.50001V18.4525C16.6664 18.527 16.6465 18.6002 16.6088 18.6644C16.571 18.7286 16.5166 18.7815 16.4515 18.8176C16.3863 18.8537 16.3126 18.8716 16.2381 18.8695C16.1637 18.8675 16.0911 18.8455 16.028 18.8058L9.99967 15.025L3.97134 18.805C3.90831 18.8446 3.83583 18.8666 3.76143 18.8687C3.68702 18.8708 3.61341 18.8529 3.54825 18.8169C3.48309 18.781 3.42876 18.7282 3.39091 18.6641C3.35306 18.6 3.33306 18.5269 3.33301 18.4525V2.50001C3.33301 2.27899 3.42081 2.06703 3.57709 1.91075C3.73337 1.75447 3.94533 1.66667 4.16634 1.66667ZM14.9997 3.33334H4.99967V16.1933L9.99967 13.0592L14.9997 16.1933V3.33334Z"
           fill="#20231E"
         />
       </svg>

      )}
    </button>
  );
}