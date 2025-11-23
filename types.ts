export enum ItemType {
  LOST = 'LOST',
  FOUND = 'FOUND',
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  imageUrl: string | null;
  contactName: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface MatchResult {
  itemId: string;
  confidence: number;
  reasoning: string;
}

export interface MatchResponse {
  matches: MatchResult[];
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: string;
  color: string;
  tags: string[];
}