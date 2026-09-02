import React from 'react';
import { Newspaper } from 'lucide-react';

interface HeaderProps {
  currentTab: 'feed' | 'bots' | 'weekly';
  onSelectTab: (tab: 'feed' | 'bots' | 'weekly') => void;
  articlesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, articlesCount = 0 }) => {
  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {/* Top line with masthead info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-xs text-amber-500 font-semibold tracking-wider uppercase">Automated Digital Newspaper</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-mono">
                SYNAPSE DISPATCH
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="capitalize">{currentDateFormatted}</span>
            <span className="text-zinc-700">•</span>
            <span className="text-amber-400/90">{articlesCount} {articlesCount === 1 ? 'article' : 'articles'}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 pt-3" aria-label="Main Navigation">
          <button
            id="nav-feed-btn"
            type="button"
            onClick={() => onSelectTab('feed')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'feed'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            News Feed
          </button>

          <button
            id="nav-weekly-btn"
            type="button"
            onClick={() => onSelectTab('weekly')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'weekly'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Weekly Digest
          </button>

          <button
            id="nav-bots-btn"
            type="button"
            onClick={() => onSelectTab('bots')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'bots'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Newsroom &amp; Bots
          </button>
        </nav>
      </div>
    </header>
  );
};
