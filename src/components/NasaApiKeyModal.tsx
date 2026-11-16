import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { Language, translations } from '../data/translations';

interface NasaApiKeyModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
  onRefreshLive: () => void;
  isLoading: boolean;
  sourceStatus?: string;
}

export const NasaApiKeyModal: React.FC<NasaApiKeyModalProps> = ({
  language,
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
  onRefreshLive,
  isLoading,
  sourceStatus
}) => {
  const t = translations[language];
  const [inputKey, setInputKey] = useState(currentKey);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Support ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputKey);
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop overlay (Click outside to dismiss) */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nasa-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#86868b] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white p-2 rounded-xl hover:bg-[#f5f5f7] dark:hover:bg-[#1f2937] transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label={t.close}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4 pr-10">
          <h3 id="nasa-modal-title" className="text-base font-bold text-[#1d1d1f] dark:text-white">
            {t.apiKeyModalTitle}
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#9ca3af] mt-0.5">NASA FIRMS Active Fire Satellite Feed</p>
        </div>

        <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed mb-4">{t.apiKeyDesc}</p>

        {sourceStatus && (
          <div className="mb-4 bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] rounded-xl p-3 text-xs text-[#1d1d1f] dark:text-white font-medium">
            {sourceStatus}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="nasa-firms-map-key" className="block text-xs font-semibold text-[#1d1d1f] dark:text-white mb-1.5 cursor-pointer">
              NASA FIRMS MAP_KEY ({language === 'id' ? 'Opsional' : 'Optional'}):
            </label>
            <input
              id="nasa-firms-map-key"
              name="nasaFirmsMapKey"
              aria-label="NASA FIRMS MAP_KEY"
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j"
              className="w-full bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] rounded-xl px-3.5 py-2 text-xs font-mono text-[#1d1d1f] dark:text-white placeholder-[#86868b] dark:placeholder-[#6b7280] focus:outline-none focus:border-[#1d1d1f] dark:focus:border-emerald-500"
            />
            <p className="text-[11px] text-[#86868b] dark:text-[#9ca3af] mt-1.5">
              {language === 'id'
                ? 'Kosongkan untuk menggunakan feed satelit publik terbuka NASA secara otomatis.'
                : 'Leave blank to automatically connect via the open 24-hour global satellite feed.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e7] dark:border-[#1f2937]">
            <a
              href="https://firms.modaps.eosdis.nasa.gov/api/map_key/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0071e3] dark:text-[#38bdf8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>{t.getFreeKey}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { onRefreshLive(); onClose(); }}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-[#f5f5f7] dark:bg-[#151d2f] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-[#1d1d1f] dark:text-white rounded-xl border border-[#e5e5e7] dark:border-[#1f2937] transition font-medium min-h-[36px] cursor-pointer"
              >
                {t.usePublicFeed}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-[#1d1d1f] hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl transition shadow-xs min-h-[36px] cursor-pointer"
              >
                {t.applyKey}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
