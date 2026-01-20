import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-14 items-center">
            <h1 className="text-lg font-semibold text-white">
              Discogs Wantlist Finder
            </h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}

export default AppLayout;
