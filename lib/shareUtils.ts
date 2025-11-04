// Utility functions for social media sharing

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export const shareOnSocialMedia = {
  // Web Share API (for mobile and supported browsers)
  native: async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.log('Error sharing:', error);
        return false;
      }
    }
    return false;
  },

  // Facebook
  facebook: (data: ShareData) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },

  // Twitter/X
  twitter: (data: ShareData) => {
    const text = data.text ? `${data.title} - ${data.text}` : data.title;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },

  // LinkedIn
  linkedin: (data: ShareData) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
  },

  // WhatsApp
  whatsapp: (data: ShareData) => {
    const text = data.text ? `${data.title} - ${data.text}` : data.title;
    const url = `https://wa.me/?text=${encodeURIComponent(`${text} ${data.url}`)}`;
    window.open(url, '_blank');
  },

  // Email
  email: (data: ShareData) => {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(data.text ? `${data.text}\n\n${data.url}` : data.url);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  },

  // Copy to clipboard
  copyToClipboard: async (data: ShareData) => {
    try {
      const textToShare = data.text ? `${data.title}\n${data.text}\n${data.url}` : `${data.title}\n${data.url}`;
      await navigator.clipboard.writeText(textToShare);
      return true;
    } catch (error) {
      console.log('Error copying to clipboard:', error);
      return false;
    }
  }
};

// Helper to get current page share data
export const getCurrentPageShareData = (): ShareData => {
  return {
    title: document.title,
    text: document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
    url: window.location.href
  };
};