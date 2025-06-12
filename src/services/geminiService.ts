import type { GroundingSource, Message } from "../types";

export const sendMessage = async (
  history: Message[],
  message: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!message?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ history, message }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send message:", error);
    throw new Error("Failed to get a response from the server.");
  }
};

