import { createFileRoute } from '@tanstack/react-router';

export const indexRoute = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-4xl font-bold">☕ Brew Log</h1>
        <p className="text-gray-600">
          Welcome to your micro-roastery coffee journal. Track your brews, methods, and tasting notes.
        </p>
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500">Getting started...</p>
          <ul className="list-inside list-disc space-y-2 text-gray-700">
            <li>Add a new brew entry</li>
            <li>Filter brews by method</li>
            <li>Rate and review your coffee</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
