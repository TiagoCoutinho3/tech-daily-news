import React, { useState } from 'react';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { WeeklyDigest } from './components/WeeklyDigest';
import { BotsPage } from './components/BotsPage';
import { NEWS_ARTICLES } from './data/newsData';
import { Newspaper, Radio } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'bots' | 'weekly'>('feed');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans antialiased selection:bg-amber-500/20 selection:text-amber-300">
      {/* Editorial Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        articlesCount={NEWS_ARTICLES.length}
      />

      {/* Main Reading Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activeTab === 'feed' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
                  Latest Verified News
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {NEWS_ARTICLES.length} {NEWS_ARTICLES.length === 1 ? 'article in feed' : 'articles in feed'}
              </span>
            </div>

            {NEWS_ARTICLES.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold font-mono text-zinc-200">
                  Awaiting First Publications
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  No articles have been processed yet in <code className="text-amber-400/90 font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded">data/posts.json</code>. The automation workflows will populate the feed with news and editorial panel debates.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {NEWS_ARTICLES.map((article) => (
                  <NewsCard key={article.id} post={article} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'weekly' && <WeeklyDigest />}

        {activeTab === 'bots' && <BotsPage />}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs font-mono text-zinc-400">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="text-zinc-400">
            SYNAPSE DISPATCH — Daily automated technology news publication.
          </p>
          <p className="text-zinc-500 text-[11px]">
            The factual summary is written by Nexus Editor based on journalistic sources. Opinions below each story reflect the perspectives of the respective editorial panel bots.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
