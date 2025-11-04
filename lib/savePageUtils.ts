// Utility functions for saving/bookmarking pages

export interface SavedPage {
  id: string;
  title: string;
  url: string;
  description?: string;
  savedAt: string;
}

// Use localStorage for now - could be moved to database later
const SAVED_PAGES_KEY = 'homeopathway_saved_pages';

export const savePageUtils = {
  // Get all saved pages
  getSavedPages: (): SavedPage[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem(SAVED_PAGES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error getting saved pages:', error);
      return [];
    }
  },

  // Save current page
  savePage: (pageData?: Partial<SavedPage>): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const currentPages = savePageUtils.getSavedPages();
      
      const newPage: SavedPage = {
        id: pageData?.id || window.location.pathname,
        title: pageData?.title || document.title,
        url: pageData?.url || window.location.href,
        description: pageData?.description || document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
        savedAt: new Date().toISOString()
      };

      // Check if page is already saved
      const existingIndex = currentPages.findIndex(page => page.id === newPage.id);
      
      if (existingIndex >= 0) {
        // Update existing
        currentPages[existingIndex] = newPage;
      } else {
        // Add new
        currentPages.unshift(newPage);
      }

      localStorage.setItem(SAVED_PAGES_KEY, JSON.stringify(currentPages));
      return true;
    } catch (error) {
      console.error('Error saving page:', error);
      return false;
    }
  },

  // Remove saved page
  removePage: (pageId: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const currentPages = savePageUtils.getSavedPages();
      const filteredPages = currentPages.filter(page => page.id !== pageId);
      
      localStorage.setItem(SAVED_PAGES_KEY, JSON.stringify(filteredPages));
      return true;
    } catch (error) {
      console.error('Error removing saved page:', error);
      return false;
    }
  },

  // Check if current page is saved
  isPageSaved: (pageId?: string): boolean => {
    if (typeof window === 'undefined') return false;

    const id = pageId || window.location.pathname;
    const savedPages = savePageUtils.getSavedPages();
    return savedPages.some(page => page.id === id);
  },

  // Toggle save status of current page
  toggleSave: (pageData?: Partial<SavedPage>): boolean => {
    const id = pageData?.id || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    if (savePageUtils.isPageSaved(id)) {
      return !savePageUtils.removePage(id); // Return false if successfully removed (not saved)
    } else {
      return savePageUtils.savePage(pageData); // Return true if successfully saved
    }
  }
};