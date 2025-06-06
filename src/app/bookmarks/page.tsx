import BookmarksClient from "@/components/bookmarks/BookmarksClient";

interface Bookmark {
  id: string;
  playlist?: { title: string; channel: string; link: string };
  courseraCourse?: { name: string; description: string; registrationLink: string };
  udemyCourse?: { name: string; description: string; registrationLink: string };
  blog?: { title: string; description: string; link: string };
}


export default async function BookmarksPage() {
  

  return (
    <div>
      <title>My Bookmarks - Learning Resources</title>
      <meta name="description" content="View your saved playlists, courses, and blog posts" />
      
      <BookmarksClient  />
    </div>
  );
}