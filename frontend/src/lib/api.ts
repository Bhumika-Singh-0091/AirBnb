import type { Listing, ListingDetail, Review, User } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: "same-origin", cache: "no-store", ...init });
  if (!res.ok) {
    let message = "Something went wrong";
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail))
        message = body.detail.map((d: { msg: string }) => d.msg).join(", ");
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  me: () => request<User | null>("/auth/me"),
  login: (username: string, password: string) => request<User>("/auth/login", json("POST", { username, password })),
  signup: (username: string, email: string, password: string) =>
    request<User>("/auth/signup", json("POST", { username, email, password })),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  listings: (q?: string) => request<Listing[]>(`/listings${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  listing: (id: string | number) => request<ListingDetail>(`/listings/${id}`),
  createListing: (form: FormData) => request<Listing>("/listings", { method: "POST", body: form }),
  updateListing: (id: string | number, form: FormData) =>
    request<Listing>(`/listings/${id}`, { method: "PUT", body: form }),
  deleteListing: (id: string | number) => request<{ ok: boolean }>(`/listings/${id}`, { method: "DELETE" }),

  createReview: (id: string | number, rating: number, comment: string) =>
    request<Review>(`/listings/${id}/reviews`, json("POST", { rating, comment })),
  deleteReview: (id: string | number, reviewId: number) =>
    request<{ ok: boolean }>(`/listings/${id}/reviews/${reviewId}`, { method: "DELETE" }),
};

export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";
export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
