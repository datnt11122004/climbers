import AppDetailView from '@/views/app-detail';

export default async function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
      <AppDetailView appId={Number(id)} />
    </main>
  );
}
