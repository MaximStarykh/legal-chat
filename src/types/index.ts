
export enum Sender {
  USER = 'user',
  AI = 'ai',
}

export interface GroundingSource {
  /** The URI of the source */
  uri: string;
  /** The title of the source, falls back to URI if not provided */
  title: string;
}

export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** The sender of the message (user or AI) */
  sender: Sender;
  /** The message content */
  text: string;
  /** When the message was created */
  timestamp: Date;
  /** Optional sources/references for the message content */
  sources?: GroundingSource[];
}

export interface ErrorState {
  /** Error message to display to the user */
  message: string;
  /** Optional error code for handling specific error cases */
  code?: string;
  /** Whether the error is recoverable */
  isRecoverable: boolean;
}

/**
 * Represents the state of an API operation
 */
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
