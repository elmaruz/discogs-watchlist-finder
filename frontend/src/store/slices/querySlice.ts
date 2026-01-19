import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
}

export interface QueryState {
  messages: Message[];
  isStreaming: boolean;
  currentStreamingText: string;
  currentSql: string;
  conversationId: string | null;
}

const initialState: QueryState = {
  messages: [],
  isStreaming: false,
  currentStreamingText: '',
  currentSql: '',
  conversationId: null,
};

const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: action.payload,
      });
    },
    streamingStarted(state) {
      state.isStreaming = true;
      state.currentStreamingText = '';
      state.currentSql = '';
    },
    sqlReceived(state, action: PayloadAction<string>) {
      state.currentSql = action.payload;
    },
    streamingChunk(state, action: PayloadAction<string>) {
      state.currentStreamingText += action.payload;
    },
    streamingCompleted(state, action: PayloadAction<string | undefined>) {
      state.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: state.currentStreamingText,
        sql: state.currentSql,
      });
      state.isStreaming = false;
      state.currentStreamingText = '';
      state.currentSql = '';
      if (action.payload) {
        state.conversationId = action.payload;
      }
    },
    streamingError(state, action: PayloadAction<string>) {
      state.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${action.payload}`,
      });
      state.isStreaming = false;
      state.currentStreamingText = '';
      state.currentSql = '';
    },
    clearMessages(state) {
      state.messages = [];
      state.conversationId = null;
    },
  },
});

export const {
  addUserMessage,
  streamingStarted,
  sqlReceived,
  streamingChunk,
  streamingCompleted,
  streamingError,
  clearMessages,
} = querySlice.actions;

export default querySlice.reducer;
