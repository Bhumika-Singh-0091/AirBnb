export interface User {
  id: number;
  username: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  image: { url: string; filename: string };
  price: number;
  location: string;
  country: string;
  geometry: { type: string; coordinates: [number, number] }; // [lng, lat]
  owner: User;
  review_count: number;
  avg_rating: number | null;
}

export interface ListingDetail extends Listing {
  reviews: Review[];
}

export interface ListingFormValues {
  title: string;
  description: string;
  location: string;
  country: string;
  price: string;
}
