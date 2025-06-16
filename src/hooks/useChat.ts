import { useMutation } from '@tanstack/react-query';
import { useChatStore } from '@/store/chatStore';
import { apiClient } from '@/services/apiClient';
import { z } from 'zod';

const ChatResponseSchema = z.object({
  text: z.string(),
  sources: z
    .array(
      z.object({
        uri: z.string(),
        title: z.string(),
        text: z.string().optional(),
      })
    )
    .optional(),
});

type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const useChat = () => {
  const messages = useChatStore((s) => s.messages);
  const add = useChatStore((s) => s.add);

  const mutation = useMutation<ChatResponse, Error, string>({
    mutationFn: async (message: string) => {
      const { data, error } = await apiClient.postChat<ChatResponse>({
        history: messages,
        message,
      });
      if (!data || error) throw new Error(error || 'Request failed');
      return ChatResponseSchema.parse(data);
    },
    onSuccess: (data) => {
      add({
        role: 'model',
        parts: [{ text: data.text }],
        sources: data.sources,
      });
    },
  });

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    add({ role: 'user', parts: [{ text: userMessage }] });
    await mutation.mutateAsync(userMessage);
  };

  return {
    messages,
    loading: mutation.isPending,
    error: mutation.isError ? (mutation.error as Error).message : null,
    handleSendMessage,
  };
};
