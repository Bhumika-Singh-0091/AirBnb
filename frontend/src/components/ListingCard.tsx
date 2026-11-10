"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { DEFAULT_IMAGE, formatPrice } from "@/lib/api";
import type { Listing } from "@/lib/types";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [wished, setWished] = useState(false);

  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWished(!wished);
  };

  return (
    <div className="col listing-item">
      <Link href={`/listings/${listing.id}`} className="listing-link">
        <div className="card listing-card h-100">
          <div className="img-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="card-img-top" src={listing.image?.url || DEFAULT_IMAGE} alt={listing.title} loading="lazy" />
            <span className="card-badge">
              <i className="fa-solid fa-location-dot me-1"></i>
              {listing.country}
            </span>
            <button className={`wishlist-btn${wished ? " active" : ""}`} onClick={toggle} aria-label="Save to wishlist">
              <i className={`${wished ? "fa-solid" : "fa-regular"} fa-heart`} style={wished ? { color: "#EF4444" } : undefined}></i>
            </button>
          </div>
          <div className="card-body">
            <div className="card-location">
              <i className="fa-solid fa-location-dot"></i> {listing.location}, {listing.country}
            </div>
            <div className="card-title-text">{listing.title}</div>
            <div className="d-flex justify-content-between align-items-center mt-1">
              <div className="card-price">
                {formatPrice(listing.price)} <span>/ night</span>
              </div>
              <div className="card-rating">
                <i className="fa-solid fa-star star-icon"></i>
                <span>{listing.avg_rating ? listing.avg_rating.toFixed(1) : "New"}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
