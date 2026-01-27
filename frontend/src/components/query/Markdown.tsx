import ReactMarkdown from 'react-markdown';

interface MarkdownProps {
  content: string;
}

function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="rounded bg-gray-700 px-1 py-0.5 text-sm">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto rounded bg-gray-700 p-2 text-sm last:mb-0">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        h1: ({ children }) => <h1 className="mb-2 text-xl font-bold text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 text-lg font-bold text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 font-bold text-white">{children}</h3>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default Markdown;
