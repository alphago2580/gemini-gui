interface StatsMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StatsConversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: StatsMessage[];
}

export interface ConversationStatistics {
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageMessagesPerConversation: number;
  longestConversation: { title: string; messageCount: number } | null;
  shortestConversation: { title: string; messageCount: number } | null;
  totalCharacters: number;
  averageMessageLength: number;
  emptyConversations: number;
}

export function calculateConversationStats(conversations: StatsConversation[]): ConversationStatistics {
  if (conversations.length === 0) {
    return {
      totalConversations: 0,
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      averageMessagesPerConversation: 0,
      longestConversation: null,
      shortestConversation: null,
      totalCharacters: 0,
      averageMessageLength: 0,
      emptyConversations: 0,
    };
  }

  let totalMessages = 0;
  let userMessages = 0;
  let assistantMessages = 0;
  let totalCharacters = 0;
  let emptyConversations = 0;
  let longestConv: { title: string; messageCount: number } | null = null;
  let shortestConv: { title: string; messageCount: number } | null = null;

  for (const conv of conversations) {
    const msgCount = conv.messages.length;
    totalMessages += msgCount;

    if (msgCount === 0) {
      emptyConversations++;
    }

    for (const msg of conv.messages) {
      if (msg.role === 'user') userMessages++;
      else assistantMessages++;
      totalCharacters += msg.content.length;
    }

    if (longestConv === null || msgCount > longestConv.messageCount) {
      longestConv = { title: conv.title, messageCount: msgCount };
    }
    if (shortestConv === null || msgCount < shortestConv.messageCount) {
      shortestConv = { title: conv.title, messageCount: msgCount };
    }
  }

  return {
    totalConversations: conversations.length,
    totalMessages,
    userMessages,
    assistantMessages,
    averageMessagesPerConversation: Math.round((totalMessages / conversations.length) * 10) / 10,
    longestConversation: longestConv,
    shortestConversation: shortestConv,
    totalCharacters,
    averageMessageLength: totalMessages > 0 ? Math.round(totalCharacters / totalMessages) : 0,
    emptyConversations,
  };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
