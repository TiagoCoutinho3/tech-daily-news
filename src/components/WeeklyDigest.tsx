import React from 'react';
import { getWeeklyEdition, BOTS } from '../data/newsData';
import { Quote, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const WeeklyDigest: React.FC = () => {
  const edition = getWeeklyEdition();

  if (!edition) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center">
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3 opacity-60" />
        <h2 className="text-lg font-bold font-mono text-zinc-200 mb-2">
          No weekly edition available yet
        </h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Weekly summaries and debates will be compiled automatically as news is ingested and processed by the editorial bot panel.
        </p>
      </div>
    );
  }

  const bot1 = BOTS[edition.highlightDebate.bot1.botId] || BOTS.cynic;
  const bot2 = BOTS[edition.highlightDebate.bot2.botId] || BOTS.optimist;
  const editor = BOTS.editor;

  return (
    <div className="space-y-8">
      {/* Masthead Banner for the Weekly Essay */}
      <article className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 sm:p-9 shadow-sm">
        {/* Edition header */}
        <div className="border-b border-zinc-800 pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-amber-400 mb-3">
            <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 font-semibold uppercase tracking-wider">
              Weekly Editor&apos;s Essay
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Edition #{edition.editionNumber}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{edition.dateRange}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-3 leading-tight">
            {edition.title}
          </h2>

          <p className="text-base text-zinc-400 leading-relaxed max-w-3xl">
            {edition.subtitle}
          </p>
        </div>

        {/* Essay Sections */}
        <div className="space-y-8">
          {edition.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 font-mono">
                {section.title}
              </h3>

              <div className="space-y-3 text-zinc-300 text-[15px] sm:text-base leading-relaxed">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {section.pullQuote && (
                <div className="my-6 p-5 rounded-lg bg-zinc-950/60 border-l-2 border-amber-500 text-zinc-200 italic text-base sm:text-lg">
                  <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-amber-500 shrink-0 mt-1 opacity-70" />
                    <span>&ldquo;{section.pullQuote}&rdquo;</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Featured Bot Debate from the Week */}
        <div className="mt-10 pt-8 border-t border-zinc-800">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            {edition.highlightDebate.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bot 1 Quote */}
            {bot1 && (
              <div
                className="p-5 rounded-lg bg-zinc-950/60 border"
                style={{ borderColor: `${bot1.accentColor}30` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <motion.img
                    src={`https://api.dicebear.com/10.x/voxel-bot/svg?seed=${bot1.avatarSeed}`}
                    alt={bot1.name}
                    className="w-6 h-6 rounded shrink-0 border"
                    style={{
                      borderColor: `${bot1.accentColor}40`
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    whileTap={{ scale: 0.95 }}
                  />
                  <span className="text-sm font-semibold text-zinc-200">{bot1.name}</span>
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${bot1.accentColor}15`,
                      color: bot1.accentColor
                    }}
                  >
                    {bot1.personality}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;{edition.highlightDebate.bot1.quote}&rdquo;
                </p>
              </div>
            )}

            {/* Bot 2 Quote */}
            {bot2 && (
              <div
                className="p-5 rounded-lg bg-zinc-950/60 border"
                style={{ borderColor: `${bot2.accentColor}30` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <motion.img
                    src={`https://api.dicebear.com/10.x/voxel-bot/svg?seed=${bot2.avatarSeed}`}
                    alt={bot2.name}
                    className="w-6 h-6 rounded shrink-0 border"
                    style={{
                      borderColor: `${bot2.accentColor}40`
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    whileTap={{ scale: 0.95 }}
                  />
                  <span className="text-sm font-semibold text-zinc-200">{bot2.name}</span>
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${bot2.accentColor}15`,
                      color: bot2.accentColor
                    }}
                  >
                    {bot2.personality}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;{edition.highlightDebate.bot2.quote}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Editorial Sign-off */}
        <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Signed: <strong className="text-zinc-200">{editor.name}</strong> ({editor.personality})</span>
          <span>Synapse Dispatch • Weekly Edition</span>
        </div>
      </article>
    </div>
  );
};
