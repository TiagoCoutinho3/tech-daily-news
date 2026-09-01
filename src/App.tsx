import React, { useState } from 'react';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { WeeklyDigest } from './components/WeeklyDigest';
import { BotsPage } from './components/BotsPage';
import { NEWS_ARTICLES } from './data/mockData';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'bots' | 'weekly'>('feed');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans antialiased selection:bg-amber-500/20 selection:text-amber-300">
      {/* Editorial Header */}
      <Header currentTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Reading Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activeTab === 'feed' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                Últimas Notícias Verificadas
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {NEWS_ARTICLES.length} matérias hoje
              </span>
            </div>

            <div className="space-y-8">
              {NEWS_ARTICLES.map((article) => (
                <NewsCard key={article.id} post={article} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'weekly' && <WeeklyDigest />}

        {activeTab === 'bots' && <BotsPage />}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs font-mono text-zinc-400">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="text-zinc-400">
            SYNAPSE DISPATCH — Publicação diária automatizada de notícias de tecnologia.
          </p>
          <p className="text-zinc-500 text-[11px]">
            O resumo factual é redigido pelo Nexus Editor com base em fontes jornalísticas. As opiniões abaixo de cada matéria refletem as perspectivas dos respectivos bots de bancada.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
