import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector, useSSE } from '../../hooks';
import {
  addUserMessage,
  streamingStarted,
  sqlReceived,
  streamingChunk,
  streamingCompleted,
  streamingError,
  clearMessages,
} from '../../store/slices/querySlice';
import StreamingMessage from './StreamingMessage';
import type { QueryEvent } from '@discogs-wantlist-finder/lib';

function ChatInterface() {
  const [input, setInput] = useState('');
  const dispatch = useAppDispatch();
  const { messages, isStreaming, currentStreamingText } = useAppSelector(
    (state) => state.query
  );
  const { startStream } = useSSE<QueryEvent>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const question = input.trim();
    setInput('');
    dispatch(addUserMessage(question));
    dispatch(streamingStarted());

    startStream(
      '/api/query',
      { question, history: messages },
      {
        onMessage: (event) => {
          switch (event.type) {
            case 'thinking':
              // Could show a thinking indicator
              break;
            case 'sql':
              dispatch(sqlReceived(event.sql));
              break;
            case 'chunk':
              dispatch(streamingChunk(event.content));
              break;
            case 'done':
              dispatch(streamingCompleted());
              break;
            case 'error':
              dispatch(streamingError(event.message));
              break;
          }
        },
        onError: (error) => {
          dispatch(streamingError(error.message));
        },
      }
    );
  };

  const handleClear = () => {
    dispatch(clearMessages());
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">
              Ask a question about your wantlist data
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${
              message.role === 'user' ? 'ml-auto max-w-[80%]' : 'max-w-full'
            }`}
          >
            {message.role === 'user' ? (
              <div className="rounded-lg bg-blue-600 p-4">
                <p className="text-white">{message.content}</p>
              </div>
            ) : message.isError ? (
              <div className="rounded-lg border border-red-800 bg-red-900/20 p-4">
                <p className="text-red-300">{message.content}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {message.sql && (
                  <details className="rounded-lg bg-gray-800/50 p-2">
                    <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                      SQL Query
                    </summary>
                    <pre className="mt-2 overflow-x-auto text-xs text-gray-300">
                      {message.sql}
                    </pre>
                  </details>
                )}
                <div className="rounded-lg bg-gray-800 p-4">
                  <p className="whitespace-pre-wrap text-gray-100">
                    {message.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isStreaming && (
          <StreamingMessage
            content={currentStreamingText}
            isStreaming={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-700 pt-4">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your wantlist..."
            disabled={isStreaming}
            className="flex-1 rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isStreaming}
              className="rounded-md border border-gray-600 px-4 py-2 font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
