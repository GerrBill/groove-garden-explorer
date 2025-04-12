
export interface Album {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  year: string | null;
  track_count: string | null;
  duration: string | null;
  created_at: string;
}

export interface Track {
  id: string;
  album_id: string;
  title: string;
  artist: string;
  duration: string;
  plays: number;
  track_number: number;
  is_liked: boolean;
  created_at: string;
}
