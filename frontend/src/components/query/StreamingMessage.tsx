interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
}

function StreamingMessage({ content, isStreaming }: StreamingMessageProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <p className="whitespace-pre-wrap text-gray-100">
        {content}
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-400" />
        )}
      </p>
    </div>
  );
}

export default StreamingMessage;
