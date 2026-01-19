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
}

const initialState: QueryState = {
  messages: [],
  isStreaming: false,
  currentStreamingText: '',
  currentSql: '',
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
    streamingCompleted(state) {
      state.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: state.currentStreamingText,
        sql: state.currentSql,
      });
      state.isStreaming = false;
      state.currentStreamingText = '';
      state.currentSql = '';
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
