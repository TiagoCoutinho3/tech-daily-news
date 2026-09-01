import { BotInfo, BotPersonality, NewsPost, WeeklyEdition } from '../types';
import postsJson from '../../data/posts.json';
import personasJson from '../../data/personas.json';

interface RawPersona {
  id?: string;
  nome: string;
  tag_personalidade: string;
  toneType: string;
  avatar_seed?: string;
  accent_color?: string;
  descricao: string;
  system_prompt?: string;
  temperature?: number;
}

const personalityDisplayLabels: Record<string, string> = {
  editor: 'Editor Factual',
  factual: 'Editor Factual',
  cynic: 'Cínico',
  cínico: 'Cínico',
  optimist: 'Otimista',
  otimista: 'Otimista',
  skeptic: 'Cético',
  cético: 'Cético',
  humorous: 'Humor & Sátira',
  engraçado: 'Humor & Sátira'
};

// Process personas into standard BotInfo objects
const rawPersonas = personasJson as Record<string, RawPersona>;

export const BOTS: Record<string, BotInfo> = Object.entries(rawPersonas).reduce(
  (acc, [key, p]) => {
    const rawTag = (p.tag_personalidade || key).toLowerCase();
    const shortDesc = p.descricao ? p.descricao.split('.')[0] + '.' : '';

    acc[key] = {
      id: p.id || key,
      name: p.nome || key,
      personality: personalityDisplayLabels[rawTag] || p.tag_personalidade || p.nome,
      toneType: (p.toneType as BotPersonality) || 'neutral',
      avatarSeed: p.avatar_seed || p.nome || key,
      accentColor: p.accent_color || '#f59e0b',
      description: p.descricao || '',
      shortBio: shortDesc
    };
    return acc;
  },
  {} as Record<string, BotInfo>
);

// Fallback editor if not defined in personas.json
if (!BOTS.editor) {
  BOTS.editor = {
    id: 'editor',
    name: 'Nexus Editor',
    personality: 'Editor Factual',
    toneType: 'neutral',
    avatarSeed: 'NexusEditorBot',
    accentColor: '#f59e0b',
    shortBio: 'Sintetiza os fatos brutos com base em fontes primárias.',
    description: 'Editor-chefe responsável pela curadoria e síntese estritamente factual das notícias.'
  };
}

// Real news posts loaded from data/posts.json
export const NEWS_ARTICLES: NewsPost[] = (postsJson as NewsPost[]) || [];

// Helper to format ISO date strings into readable pt-BR dates
export function formatNewsDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Helper to build a dynamic Weekly Edition based on real articles in posts.json
export function getWeeklyEdition(): WeeklyEdition | null {
  if (!NEWS_ARTICLES || NEWS_ARTICLES.length === 0) {
    return null;
  }

  // Find featured debate from real posts
  let debatePost = NEWS_ARTICLES.find(
    (p) => p.replies && p.replies.length >= 2 && p.replies.some((r) => r.botId === 'cynic') && p.replies.some((r) => r.botId === 'optimist')
  );

  if (!debatePost && NEWS_ARTICLES.length > 0) {
    debatePost = NEWS_ARTICLES[0];
  }

  const cynicReply = debatePost?.replies?.find((r) => r.botId === 'cynic') || debatePost?.replies?.[0];
  const optimistReply = debatePost?.replies?.find((r) => r.botId === 'optimist') || debatePost?.replies?.[1];

  // Derive date range from articles
  const firstDate = NEWS_ARTICLES[NEWS_ARTICLES.length - 1]?.publishedAt;
  const lastDate = NEWS_ARTICLES[0]?.publishedAt;
  const dateRangeStr = `${formatNewsDate(firstDate)} — ${formatNewsDate(lastDate)}`;

  // Summary sections from real posts
  const topArticles = NEWS_ARTICLES.slice(0, 3);
  const sections = topArticles.map((article) => ({
    title: article.title,
    content: article.paragraphs.slice(0, 2),
    pullQuote: article.paragraphs[0]
  }));

  return {
    editionNumber: 1,
    dateRange: dateRangeStr,
    title: 'Panorama dos Últimos Desdobramentos em Tecnologia',
    subtitle: `Compilação das ${NEWS_ARTICLES.length} notícias verificadas e comentadas pela bancada editorial automática.`,
    sections,
    highlightDebate: {
      title: `Debate em Destaque: "${debatePost?.title || 'Discussão Tech'}"`,
      bot1: {
        botId: cynicReply?.botId || 'cynic',
        quote: cynicReply?.text || 'Aguardando comentários da bancada.'
      },
      bot2: {
        botId: optimistReply?.botId || 'optimist',
        quote: optimistReply?.text || 'Aguardando comentários da bancada.'
      }
    },
    conclusion: 'Acompanhe as atualizações contínuas geradas pelos workflows automáticos de ingestão e análise de IA.'
  };
}
