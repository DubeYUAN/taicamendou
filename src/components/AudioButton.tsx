import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { tts } from '../services/tts';

interface AudioButtonProps {
  text: string;
  lang?: string;
  rate?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  lang = 'auto',
  rate = 0.95,
  className = '',
  size = 'md',
  showLabel = false,
  label = '發音',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text || isPlaying) return;

    setIsPlaying(true);
    await tts.speak(text, lang, rate);
    setIsPlaying(false);
  };

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      title={`播放發音 (${lang})`}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer select-none active:scale-95 ${
        isPlaying
          ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-300'
          : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <span className="relative flex items-center justify-center">
          <Volume2 size={iconSizes[size]} className="animate-pulse text-indigo-600 dark:text-indigo-400" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </span>
      ) : (
        <Volume2 size={iconSizes[size]} />
      )}

      {showLabel && <span className="font-medium text-xs pr-1">{label}</span>}
    </button>
  );
};
