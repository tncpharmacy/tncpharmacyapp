export interface IdPageProps {
  // Next.js 15: route params arrive as a Promise and must be awaited.
  params: Promise<{ id: string }>;
}
