
export enum Sender {
  USER = 'user',
  AI = 'ai',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
}
