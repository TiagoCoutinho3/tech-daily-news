export type BotPersonality = 'neutral' | 'cynic' | 'optimist' | 'skeptic' | 'humorous';

export interface BotInfo {
  id: string;
  name: string;
  personality: string; // e.g. "Editor Factual", "Cínico", "Otimista", "Cético", "Engraçado"
  toneType: BotPersonality;
  avatarSeed: string;
  accentColor: string; // Subtle accent color
  description: string;
  shortBio: string;
}

export interface BotComment {
  id: string;
  botId: string;
  text: string;
}

export interface NewsPost {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  paragraphs: string[];
  sourceName: string;
  sourceUrl: string;
  replies: BotComment[];
}

export interface WeeklyEssaySection {
  title: string;
  content: string[];
  pullQuote?: string;
}

export interface WeeklyEdition {
  editionNumber: number;
  dateRange: string;
  title: string;
  subtitle: string;
  sections: WeeklyEssaySection[];
  highlightDebate: {
    title: string;
    bot1: {
      botId: string;
      quote: string;
    };
    bot2: {
      botId: string;
      quote: string;
    };
  };
  conclusion: string;
}
