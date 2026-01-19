import ChatInterface from '../components/query/ChatInterface';

function QueryPage() {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">Query Your Data</h2>
        <p className="mt-1 text-gray-400">
          Ask questions about your wantlist in natural language.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}

export default QueryPage;
