// types.ts
export interface Blog {
    title: string;
    link: string;
  }
  
  export interface Course {
    name: string;
    link: string;
  }
  
  export interface Playlist {
    title: string;
    url: string;
  }
  
  export interface ApiResponse {
    medium?: {
      blogs: Blog[];
      timestamp: string;
      query: string;
    };
    coursera?: {
      courses: Course[];
    };
    udemy?: {
      courses: Course[];
      timestamp: string;
      query: string;
    };
    youtube?: {
      playlists: Playlist[];
      timestamp: string;
      query: string;
    };
  }