import dynamic from 'next/dynamic';

const Bookmarks = dynamic(() => import('@/components/bookmarks/Bookmarks'), { ssr: false });

export default function Page() {
  return <Bookmarks />;
}
