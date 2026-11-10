"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useApp } from "@/context/AppContext";
import { api, DEFAULT_IMAGE, formatPrice } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";

// Leaflet touches `window`, so load it on the client only
const ListingMap = dynamic(() => import("@/components/ListingMap"), {
  ssr: false,
  loading: () => <div id="map" className="mb-4"></div>,
});

const AMENITIES = [
  { icon: "fa-wifi", label: "High-speed WiFi" },
  { icon: "fa-car", label: "Free Parking" },
  { icon: "fa-kitchen-set", label: "Full Kitchen" },
  { icon: "fa-wind", label: "Air Conditioning" },
  { icon: "fa-tv", label: "Smart TV" },
  { icon: "fa-mug-hot", label: "Coffee & Tea" },
];

const RATING_TITLES = ["Terrible", "Not good", "Average", "Very good", "Amazing"];
const sectionIcon = { color: "#7C3AED" };
const hr = { borderColor: "#E4E2FF" };

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, notify } = useApp();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .listing(id)
      .then(setListing)
      .catch((e: Error) => {
        notify("error", e.message);
        router.replace("/listings");
      });
  }, [id, notify, router]);

  useEffect(load, [load]);

  if (!listing) return <div className="text-center py-5 text-muted">Loading…</div>;

  const isOwner = !!user && user.id === listing.owner.id;

  const submitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return setValidated(true);
    setBusy(true);
    try {
      await api.createReview(id, rating || 1, comment);
      notify("success", "New Review Created!");
      setRating(0);
      setComment("");
      setValidated(false);
      load();
    } catch (err) {
      notify("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeReview = async (reviewId: number) => {
    try {
      await api.deleteReview(id, reviewId);
      notify("success", "Review Deleted!");
      load();
    } catch (err) {
      notify("error", (err as Error).message);
    }
  };

  const removeListing = async () => {
    if (!confirm("Delete this listing? This also removes its reviews.")) return;
    try {
      await api.deleteListing(id);
      notify("success", "Listing Deleted!");
      router.push("/listings");
    } catch (err) {
      notify("error", (err as Error).message);
    }
  };

  const ratingLabel = listing.avg_rating ? listing.avg_rating.toFixed(2) : "New";
  const reviewsLabel = `${listing.review_count} review${listing.review_count === 1 ? "" : "s"}`;

  return (
    <div className="row mt-4 mb-5">
      <div className="col-lg-7">
        <Link href="/listings" className="btn btn-outline-wn btn-sm mb-3">
          <i className="fa-solid fa-arrow-left me-2"></i>Back to Listings
        </Link>

        <div className="show-hero mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.image?.url || DEFAULT_IMAGE} alt={listing.title} />
          <div style={{ position: "absolute", bottom: 16, left: 16 }}>
            <span className="show-badge">
              <i className="fa-solid fa-location-dot me-1"></i>
              {listing.country}
            </span>
          </div>
        </div>

        <div className="listing-hero-tag">
          <i className="fa-solid fa-house-chimney"></i>Entire place
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {listing.title}
        </h1>
        <div className="show-meta">
          <div className="card-rating" style={{ fontSize: "0.95rem" }}>
            <i className="fa-solid fa-star star-icon"></i> {ratingLabel} &nbsp;·&nbsp;{" "}
            <span style={{ color: "#6B7280" }}>{reviewsLabel}</span>
          </div>
          <div style={{ color: "#6B7280", fontSize: "0.9rem" }}>
            <i className="fa-solid fa-location-dot me-1"></i>
            {listing.location}, {listing.country}
          </div>
        </div>

        <hr style={hr} />

        <div className="host-card">
          <div className="host-avatar">{listing.owner.username.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 700 }}>
              Hosted by <span style={{ color: "#7C3AED" }}>{listing.owner.username}</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#6B7280" }}>Joined WanderNest · Superhost</div>
          </div>
        </div>

        <div className="show-section-title">
          <i className="fa-solid fa-align-left" style={sectionIcon}></i>About this place
        </div>
        <p style={{ color: "#374151", lineHeight: 1.7 }}>{listing.description}</p>

        <hr style={hr} />
        <div className="show-section-title">
          <i className="fa-solid fa-list-check" style={sectionIcon}></i>What this place offers
        </div>
        <div className="row g-2 mb-3">
          {AMENITIES.map((a) => (
            <div className="col-6" key={a.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "#F8F7FF", borderRadius: 10 }}>
                <i className={`fa-solid ${a.icon}`} style={{ color: "#7C3AED", width: 20 }}></i>
                <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{a.label}</span>
              </div>
            </div>
          ))}
        </div>

        <hr style={hr} />
        <div className="show-section-title">
          <i className="fa-solid fa-map-pin" style={sectionIcon}></i>Where you&apos;ll be
        </div>
        <ListingMap listing={listing} />

        <hr style={hr} />
        <div className="show-section-title">
          <i className="fa-solid fa-comments" style={sectionIcon}></i>Guest Reviews
          <span style={{ fontSize: "0.82rem", color: "#6B7280", fontWeight: 400, marginLeft: 4 }}>({listing.reviews.length})</span>
        </div>

        {listing.reviews.length > 0 ? (
          listing.reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="reviewer-avatar">{r.author.username.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>@{r.author.username}</div>
                  <p className="starability-result mb-0" data-rating={r.rating}></p>
                </div>
                {user?.id === r.author.id && (
                  <button
                    className="btn btn-sm ms-auto"
                    style={{ background: "none", border: "1px solid #EF4444", color: "#EF4444", borderRadius: 8, padding: "3px 10px", fontSize: "0.78rem" }}
                    title="Delete review"
                    onClick={() => removeReview(r.id)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151", lineHeight: 1.6 }}>{r.comment}</p>
            </div>
          ))
        ) : (
          <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>No reviews yet. Be the first to review!</p>
        )}

        {user ? (
          <div style={{ background: "#F8F7FF", borderRadius: 16, padding: "1.5rem", marginTop: "1.5rem", border: "1px solid #EDE9FE" }}>
            <div className="show-section-title mb-3">
              <i className="fa-solid fa-pen" style={sectionIcon}></i>Leave a Review
            </div>
            <form noValidate className={`needs-validation${validated ? " was-validated" : ""}`} onSubmit={submitReview}>
              <div className="mb-3">
                <label className="form-label">Your Rating</label>
                <fieldset className="starability-slot">
                  <input type="radio" id="no-rate" className="input-no-rate" name="rating" value="0"
                    checked={rating === 0} onChange={() => setRating(0)} aria-label="No rating." />
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} style={{ display: "contents" }}>
                      <input type="radio" id={`first-rate${n}`} name="rating" value={n}
                        checked={rating === n} onChange={() => setRating(n)} />
                      <label htmlFor={`first-rate${n}`} title={RATING_TITLES[n - 1]}>{n} star{n > 1 ? "s" : ""}</label>
                    </span>
                  ))}
                </fieldset>
              </div>
              <div className="mb-3">
                <label className="form-label">Your Comment</label>
                <textarea rows={4} className="form-control" placeholder="Share your experience…" required
                  value={comment} onChange={(e) => setComment(e.target.value)} />
                <div className="invalid-feedback">Please add a comment.</div>
              </div>
              <button className="btn btn-primary-wn" disabled={busy}>{busy ? "Submitting…" : "Submit Review"}</button>
            </form>
          </div>
        ) : (
          <div style={{ background: "#F8F7FF", borderRadius: 12, padding: "1rem 1.5rem", textAlign: "center", border: "1px dashed #C4B5FD", marginTop: "1rem" }}>
            <i className="fa-solid fa-lock me-2" style={{ color: "#7C3AED" }}></i>
            <Link href={`/login?next=/listings/${id}`} style={{ color: "#7C3AED", fontWeight: 600 }}>Log in</Link> to leave a review
          </div>
        )}
      </div>

      <div className="col-lg-4 offset-lg-1 mt-4 mt-lg-0">
        <div style={{ position: "sticky", top: 90 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "1.8rem", boxShadow: "0 8px 30px rgba(124,58,237,0.12)", border: "1px solid #EDE9FE", marginBottom: "1.2rem" }}>
            <div className="price-tag">{formatPrice(listing.price)} <span>/ night</span></div>
            <div className="card-rating my-2">
              <i className="fa-solid fa-star star-icon"></i> {ratingLabel} · {reviewsLabel}
            </div>
            <hr style={{ borderColor: "#EDE9FE" }} />
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Check-in</label>
                <input type="date" className="form-control form-control-sm" />
              </div>
              <div className="col-6">
                <label className="form-label">Check-out</label>
                <input type="date" className="form-control form-control-sm" />
              </div>
              <div className="col-12">
                <label className="form-label">Guests</label>
                <select className="form-control form-control-sm">
                  <option>1 guest</option>
                  <option>2 guests</option>
                  <option>3 guests</option>
                  <option>4+ guests</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary-wn w-100" style={{ fontSize: "1rem", padding: "0.8rem" }}>Reserve Now</button>
            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#9CA3AF", marginTop: "0.8rem" }}>You won&apos;t be charged yet</p>
          </div>

          {isOwner && (
            <div style={{ background: "white", borderRadius: 16, padding: "1.2rem", border: "1px solid #EDE9FE" }}>
              <div style={{ fontSize: "0.82rem", color: "#9CA3AF", marginBottom: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Your Listing
              </div>
              <div className="d-grid gap-2">
                <Link href={`/listings/${listing.id}/edit`} className="btn btn-outline-wn">
                  <i className="fa-solid fa-pen me-2"></i>Edit Listing
                </Link>
                <button className="btn btn-danger-wn w-100" onClick={removeListing}>
                  <i className="fa-solid fa-trash me-2"></i>Delete Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
