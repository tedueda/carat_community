export interface User {
  id: number;
  display_name: string;
  email: string;
}

export interface Post {
  id: number;
  title?: string;
  body: string;
  user_id: number;
  user_display_name?: string;
  visibility: string;
  created_at: string;
  category?: string;
  subcategory?: string;
  media_id?: number | null;
  media_url?: string;
  media_urls?: string[];
  youtube_url?: string;
  like_count?: number;
  comment_count?: number;
  points?: number;
  tags?: string[];
  is_liked?: boolean;
  post_type?: string;
  slug?: string;
  status?: string;
  excerpt?: string;
  og_image_url?: string;
  prefecture?: string;
  event_date?: string;
  fee?: string;
  // Translation fields
  original_lang?: string;
}

export interface PostWithTranslation extends Post {
  view_lang: string;
  display_title?: string;
  display_text: string;
  has_translation: boolean;
  is_translated: boolean;
}

export interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: {
    id: number;
    display_name: string;
  };
}
