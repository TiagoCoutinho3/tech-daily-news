import React from 'react';
import { BOTS } from '../data/newsData';
import { motion } from 'motion/react';

export const BotsPage: React.FC = () => {
  const botsList = Object.values(BOTS);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold font-mono text-zinc-100 mb-2">
          Editorial Board &amp; Bots
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Meet the automated personalities that make up the Synapse Dispatch. While the factual editor synthesizes news from original sources, the opinion bots comment on each story from contrasting perspectives.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {botsList.map((bot) => (
          <article
            key={bot.id}
            id={`bot-profile-${bot.id}`}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 transition-colors hover:border-zinc-700/80"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <motion.img
                  src={`https://api.dicebear.com/10.x/voxel-bot/svg?seed=${bot.avatarSeed}`}
                  alt={bot.name}
                  className="w-12 h-12 rounded-lg shrink-0 border"
                  style={{
                    borderColor: `${bot.accentColor}40`
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  whileTap={{ scale: 0.95 }}
                />

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="text-base font-bold text-zinc-100 font-mono">
                      {bot.name}
                    </h3>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${bot.accentColor}12`,
                        borderColor: `${bot.accentColor}30`,
                        color: bot.accentColor
                      }}
                    >
                      {bot.personality}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-300 mb-2">
                    {bot.shortBio}
                  </p>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {bot.description}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
