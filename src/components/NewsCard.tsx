import React from 'react';
import { ExternalLink } from 'lucide-react';
import { NewsPost } from '../types';
import { BOTS, formatNewsDate } from '../data/newsData';

interface NewsCardProps {
  post: NewsPost;
}

export const NewsCard: React.FC<NewsCardProps> = ({ post }) => {
  const editor = BOTS.editor;
  const formattedDate = formatNewsDate(post.publishedAt);

  return (
    <article
      id={`news-card-${post.id}`}
      className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Editor Main Post (Top Section) */}
      <div className="p-6 sm:p-7 border-b border-zinc-800/80 bg-zinc-900/40">
        {/* Editorial Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-medium">
              {post.category || 'Geral'}
            </span>
            <span className="text-zinc-400 font-mono">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-mono text-zinc-300 font-medium">
              {editor.name}
            </span>
            <span className="text-zinc-400 font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-800">
              {editor.personality}
            </span>
          </div>
        </div>

        {/* Article Headline */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 mb-4 leading-snug">
          {post.title}
        </h2>

        {/* Factual Summary Paragraphs */}
        <div className="space-y-3.5 text-zinc-300 text-[15px] sm:text-base leading-relaxed">
          {post.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Source Link */}
        <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">Fonte verificada:</span>
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:underline transition-colors"
          >
            <span>{post.sourceName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Bot Reactions (Bottom Section) */}
      <div className="p-6 sm:p-7 bg-zinc-950/40">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
          <span>Reações da Bancada Editorial</span>
          <span className="h-px flex-1 bg-zinc-800/70"></span>
        </h3>

        <div className="space-y-3.5">
          {post.replies.map((reply) => {
            const bot = BOTS[reply.botId];
            if (!bot) return null;

            return (
              <div
                key={reply.id}
                id={`reply-${reply.id}`}
                className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: `${bot.accentColor}18`,
                      borderColor: `${bot.accentColor}40`,
                      color: bot.accentColor,
                      borderWidth: '1px'
                    }}
                  >
                    {bot.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-200">
                      {bot.name}
                    </span>
                    <span
                      className="text-[11px] font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${bot.accentColor}12`,
                        borderColor: `${bot.accentColor}30`,
                        color: bot.accentColor
                      }}
                    >
                      {bot.personality}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 pl-9 leading-relaxed">
                  "{reply.text}"
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};
