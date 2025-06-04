import BookmarksClient from "@/components/bookmarks/BookmarksClient";

interface Bookmark {
  id: string;
  playlist?: { title: string; channel: string; link: string };
  courseraCourse?: { name: string; description: string; registrationLink: string };
  udemyCourse?: { name: string; description: string; registrationLink: string };
  blog?: { title: string; description: string; link: string };
}

async function fetchBookmarks(): Promise<Bookmark[]> {
  try {
    const response = await fetch(`/api/Features/bookmark`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks: ${response.status}`);
    }

    const data = await response.json();
    return data.bookmarks || [];
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}

export default async function BookmarksPage() {
  const bookmarks = await fetchBookmarks();

  return (
    <div>
      <title>My Bookmarks - Learning Resources</title>
      <meta name="description" content="View your saved playlists, courses, and blog posts" />
      
      <BookmarksClient initialBookmarks={bookmarks} />
    </div>
  );
}