import { create } from 'zustand';
import type { Message } from '@/types';

interface ChatState {
  messages: Message[];
  add: (message: Message) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  add: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  reset: () => set({ messages: [] }),
}));
