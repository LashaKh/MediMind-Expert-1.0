/**
 * ShareModal - Mobile-responsive share modal with multiple sharing options
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareIcon, ClipboardIcon, XMarkIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';
import type { MedicalNewsArticle } from '../../types/medicalNews';

interface ShareModalProps {
  isOpen: boolean;
  article: MedicalNewsArticle;
  onClose: () => void;
  onShare?: (article: MedicalNewsArticle, platform?: string, template?: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, article, onClose, onShare }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.sourceUrl
        });
        onShare?.(article, 'native');
      } else {
        // Fallback to clipboard
        await handleCopyLink();
      }
    } catch (error) {

    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(article.sourceUrl);
      setCopied(true);
      onShare?.(article, 'clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {

    }
  };

  const handlePlatformShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    onShare?.(article, platform);
    onClose();
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.sourceUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.sourceUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.sourceUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`${article.summary}\n\nRead more: ${article.sourceUrl}`)}`
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#90cdf4]/20 dark:bg-[#2b6cb0]/30 rounded-lg">
              <ShareIcon className="w-5 h-5 text-[#2b6cb0] dark:text-[#63b3ed]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('news.share.title', 'Share Article')}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Article Preview */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <LinkIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{article.sourceName}</span>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6 space-y-4">
          {/* Native Share (if available) */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              disabled={isSharing}
              className="w-full flex items-center gap-4 p-4 bg-[#90cdf4]/20 dark:bg-[#2b6cb0]/20 hover:bg-[#90cdf4]/30 dark:hover:bg-[#2b6cb0]/30 rounded-xl transition-colors min-h-[60px] touch-manipulation disabled:opacity-50"
            >
              <div className="p-2 bg-[#2b6cb0] rounded-lg">
                <ShareIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">{t('news.share.native', 'Share via Device')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('news.share.nativeDesc', "Use your device's native sharing")}</div>
              </div>
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors min-h-[60px] touch-manipulation"
          >
            <div className="p-2 bg-gray-500 dark:bg-gray-600 rounded-lg">
              {copied ? (
                <CheckIcon className="w-5 h-5 text-white" />
              ) : (
                <ClipboardIcon className="w-5 h-5 text-white" />
              )}
            </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {copied ? t('news.share.copied', 'Copied!') : t('news.share.copy', 'Copy Link')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {copied ? t('news.share.copiedDesc', 'Link copied to clipboard') : article.sourceUrl}
                </div>
              </div>
          </button>

          {/* Platform Shares */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePlatformShare('twitter', shareUrls.twitter)}
              className="flex flex-col items-center gap-2 p-4 bg-[#90cdf4]/20 dark:bg-[#2b6cb0]/20 hover:bg-[#90cdf4]/30 dark:hover:bg-[#2b6cb0]/30 rounded-xl transition-colors min-h-[80px] touch-manipulation"
            >
              <div className="w-8 h-8 bg-[#2b6cb0] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">𝕏</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('news.share.twitter', 'Twitter')}</span>
            </button>

            <button
              onClick={() => handlePlatformShare('linkedin', shareUrls.linkedin)}
              className="flex flex-col items-center gap-2 p-4 bg-[#90cdf4]/20 dark:bg-[#2b6cb0]/20 hover:bg-[#90cdf4]/30 dark:hover:bg-[#2b6cb0]/30 rounded-xl transition-colors min-h-[80px] touch-manipulation"
            >
              <div className="w-8 h-8 bg-[#1a365d] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">in</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('news.share.linkedin', 'LinkedIn')}</span>
            </button>

            <button
              onClick={() => handlePlatformShare('facebook', shareUrls.facebook)}
              className="flex flex-col items-center gap-2 p-4 bg-[#90cdf4]/20 dark:bg-[#2b6cb0]/20 hover:bg-[#90cdf4]/30 dark:hover:bg-[#2b6cb0]/30 rounded-xl transition-colors min-h-[80px] touch-manipulation"
            >
              <div className="w-8 h-8 bg-[#2b6cb0] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">f</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('news.share.facebook', 'Facebook')}</span>
            </button>

            <button
              onClick={() => handlePlatformShare('email', shareUrls.email)}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors min-h-[80px] touch-manipulation"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">@</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('news.share.email', 'Email')}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            <button
            onClick={onClose}
            className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium min-h-[44px] touch-manipulation"
          >
              {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;