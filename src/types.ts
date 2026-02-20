export interface RateLimit {
  callCount?: number;
  totalCpuTime?: number;
  totalTime?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  rateLimit?: RateLimit;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
    previous?: string;
  };
}

export interface MediaContainer {
  id: string;
  status?: string;
  status_code?: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

export interface ThreadsPost {
  id: string;
  text?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  shortcode?: string;
}
