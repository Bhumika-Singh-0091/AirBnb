"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import ListingCard from "@/components/ListingCard";
import { api } from "@/lib/api";
import type { Listing } from "@/lib/types";

const CATEGORIES: { key: string; label: string; icon: string; words: string[] }[] = [
  { key: "all", label: "All", icon: "fa-globe", words: [] },
  { key: "beach", label: "Beach", icon: "fa-umbrella-beach", words: ["beach", "ocean", "sea", "coast", "surf", "shore"] },
  { key: "mountain", label: "Mountains", icon: "fa-mountain", words: ["mountain", "alps", "peak", "ski", "hill"] },
  { key: "city", label: "Cities", icon: "fa-city", words: ["city", "loft", "downtown", "urban", "penthouse", "apartment"] },
  { key: "countryside", label: "Countryside", icon: "fa-tractor", words: ["countryside", "farm", "vineyard", "rural", "tuscany", "cottage"] },
  { key: "island", label: "Islands", icon: "fa-water", words: ["island", "overwater", "lagoon", "bungalow", "tropical"] },
  { key: "luxury", label: "Luxury", icon: "fa-star", words: ["luxury", "villa", "castle", "resort", "penthouse", "mansion"] },
  { key: "cabin", label: "Cabins", icon: "fa-house-chimney", words: ["cabin", "chalet", "lodge", "treehouse", "retreat"] },
];

function Listings() {
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(urlQuery);
  const [category, setCategory] = useState("all");

  useEffect(() => setQuery(urlQuery), [urlQuery]);

  useEffect(() => {
    api.listings().then(setListings).catch((e: Error) => setError(e.message));
  }, []);

  const visible = useMemo(() => {
    if (!listings) return [];
    const q = query.toLowerCase().trim();
    const words = CATEGORIES.find((c) => c.key === category)?.words ?? [];
    return listings.filter((l) => {
      const text = `${l.title} ${l.location} ${l.country} ${l.description}`.toLowerCase();
      const matchesQ = !q || `${l.title} ${l.location} ${l.country}`.toLowerCase().includes(q) || text.includes(q);
      const matchesCat = category === "all" || words.some((w) => text.includes(w));
      return matchesQ && matchesCat;
    });
  }, [listings, query, category]);

  if (error) throw new Error(error);

  return (
    <>
      <div className="hero-section">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <h1 className="hero-title">
            Find Your Perfect<br />Place to Stay 🌍
          </h1>
          <p className="hero-subtitle">Discover unique homes, villas &amp; experiences around the world</p>
          <div className="hero-search-bar">
            <input
              className="hero-search-input"
              type="text"
              placeholder="Where do you want to go?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="hero-search-btn" type="button">Search</button>
          </div>
        </div>
      </div>

      <div className="category-strip">
        <div className="container d-flex gap-1" style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          {CATEGORIES.map((c) => (
            <button key={c.key} className={`category-btn${category === c.key ? " active" : ""}`} onClick={() => setCategory(c.key)}>
              <i className={`fa-solid ${c.icon}`}></i>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="listings-grid">
        <div className="d-flex justify-content-between align-items-end mb-1">
          <div>
            <h2 className="section-title">Explore Listings</h2>
            <p className="section-subtitle">
              <span id="listingCount">{visible.length}</span> amazing places waiting for you
            </p>
          </div>
          <Link href="/listings/new" className="btn btn-primary-wn mb-3">
            <i className="fa-solid fa-plus me-2"></i>Add Listing
          </Link>
        </div>

        {listings === null ? (
          <div className="text-center py-5 text-muted">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-house-chimney-crack"></i>
            <h4>No listings found</h4>
            <p>Try a different search, or be the first to add a listing!</p>
            <Link href="/listings/new" className="btn btn-primary-wn">Add Listing</Link>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4" id="listingsGrid">
            {visible.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5 text-muted">Loading…</div>}>
      <Listings />
    </Suspense>
  );
}
