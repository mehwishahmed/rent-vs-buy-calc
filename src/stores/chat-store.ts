import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'bot';
  content: string;
  timestamp: Date;
  showChart?: boolean;
  chartType?: string;
  isTyping?: boolean;
  typingComplete?: boolean;
  chartData?: any[];
  chartInputs?: any;
  chartTitle?: string;
  chartExplanation?: string;
  chartInsights?: string[];
  chartKeyPoints?: string[];
  followUpQuestions?: string[];
}

interface UserContext {
  homePrice?: number;
  currentRent?: number;
  downPayment?: number;
  interestRate?: number;
  timeHorizon?: number;
  location?: string;
  previousMessages: string[];
}

interface ChatStore {
  // Chat state
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  userProvidedContext: Partial<UserContext>;
  
  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setInputValue: (value: string) => void;
  setIsTyping: (typing: boolean) => void;
  setUserProvidedContext: (context: Partial<UserContext>) => void;
  clearChat: () => void;
  
  // Helper to convert Date objects for serialization
  serializeMessages: () => any[];
  deserializeMessages: (serializedMessages: any[]) => ChatMessage[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      inputValue: '',
      isTyping: false,
      userProvidedContext: {},

      // Actions
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      
      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === id ? { ...msg, ...updates } : msg
        )
      })),
      
      setInputValue: (value) => set({ inputValue: value }),
      
      setIsTyping: (typing) => set({ isTyping: typing }),
      
      setUserProvidedContext: (context) => set({ userProvidedContext: context }),
      
      clearChat: () => set({ 
        messages: [], 
        inputValue: '', 
        isTyping: false, 
        userProvidedContext: {} 
      }),

      // Serialization helpers
      serializeMessages: () => {
        const { messages } = get();
        return messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }));
      },

      deserializeMessages: (serializedMessages) => {
        return serializedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    }),
    {
      name: 'chat-store',
      // Don't persist messages with Date objects to avoid serialization issues
      partialize: (state) => ({
        // Only persist user context, not messages
        userProvidedContext: state.userProvidedContext
      })
    }
  )
);

