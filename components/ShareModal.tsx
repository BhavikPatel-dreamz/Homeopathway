'use client';

import { useState } from 'react';
import { shareOnSocialMedia, getCurrentPageShareData, ShareData } from '@/lib/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData?: ShareData;
}

export default function ShareModal({ isOpen, onClose, shareData }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const data = shareData || getCurrentPageShareData();

  const handleShare = async (platform: string) => {
    switch (platform) {
      case 'native':
        const shared = await shareOnSocialMedia.native(data);
        if (shared) onClose();
        break;
      case 'facebook':
        shareOnSocialMedia.facebook(data);
        onClose();
        break;
      case 'twitter':
        shareOnSocialMedia.twitter(data);
        onClose();
        break;
      case 'linkedin':
        shareOnSocialMedia.linkedin(data);
        onClose();
        break;
      case 'whatsapp':
        shareOnSocialMedia.whatsapp(data);
        onClose();
        break;
      case 'email':
        shareOnSocialMedia.email(data);
        onClose();
        break;
      case 'copy':
        const success = await shareOnSocialMedia.copyToClipboard(data);
        if (success) {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            onClose();
          }, 1500);
        }
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Share this page</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Native Share (if supported) */}

          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            className="flex flex-col items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 mb-2 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-600">Facebook</span>
          </button>

          {/* Twitter */}
          <button
            onClick={() => handleShare('twitter')}
            className="flex flex-col items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 mb-2 bg-black rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-600">Twitter</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 mb-2 bg-green-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.431 3.516"/>
              </svg>
            </div>
            <span className="text-xs text-gray-600">WhatsApp</span>
          </button>

          {/* Email */}
          <button
            onClick={() => handleShare('email')}
            className="flex flex-col items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 mb-2 bg-gray-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">Email</span>
          </button>
        </div>

        {/* Copy Link */}
        <button
          onClick={() => handleShare('copy')}
          className="w-full p-3 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V9a1 1 0 00-1-1H9a1 1 0 00-1 1v2.586l.293-.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0L8 15.414V13a1 1 0 011-1h6a1 1 0 011-1z" />
          </svg>
          <span className="text-gray-700">
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </button>
      </div>
    </div>
  );
}