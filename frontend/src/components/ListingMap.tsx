"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/api";

const PIN =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDMyIDQwIj48cGF0aCBmaWxsPSIjRUY0NDQ0IiBkPSJNMTYgMEM4LjggMCAzIDUuOCAzIDE2YzAgOSAxMyAyNCAxMyAyNHMxMy0xNSAxMy0yNGMwLTEwLjItNS44LTE2LTEzLTE2eiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjYiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";

export default function ListingMap({ listing }: { listing: Listing }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const [lng, lat] = listing.geometry.coordinates;
    const map = L.map(ref.current).setView([lat, lng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
      minZoom: 1,
    }).addTo(map);

    const icon = L.icon({ iconUrl: PIN, iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40] });

    // Build popup with DOM nodes (textContent) so listing text can never inject HTML
    const box = document.createElement("div");
    box.style.cssText = "font-family:'Plus Jakarta Sans',sans-serif;padding:8px;";
    const title = document.createElement("div");
    title.style.cssText = "font-weight:700;font-size:14px;color:#1E1B4B;margin-bottom:4px;";
    title.textContent = `📍 ${listing.title}`;
    const where = document.createElement("div");
    where.style.cssText = "font-size:12px;color:#6B7280;";
    where.textContent = `${listing.location}, ${listing.country}`;
    const price = document.createElement("div");
    price.style.cssText = "font-size:11px;color:#9CA3AF;margin-top:4px;";
    price.textContent = `${formatPrice(listing.price)}/night`;
    box.append(title, where, price);

    L.marker([lat, lng], { icon }).addTo(map).bindPopup(box, { className: "listing-popup", maxWidth: 200 }).openPopup();

    const onResize = () => setTimeout(() => map.invalidateSize(), 250);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      map.remove();
    };
  }, [listing]);

  return <div id="map" ref={ref} className="mb-4"></div>;
}
