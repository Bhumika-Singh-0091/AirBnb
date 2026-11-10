"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ListingForm from "@/components/ListingForm";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import type { Listing } from "@/lib/types";
import { useRequireLogin } from "@/lib/useRequireLogin";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, user } = useRequireLogin();
  const { notify } = useApp();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!ready) return;
    api
      .listing(id)
      .then((l) => {
        if (l.owner.id !== user?.id) {
          notify("error", "You are not the owner of this listing");
          router.replace(`/listings/${id}`);
        } else setListing(l);
      })
      .catch((e: Error) => {
        notify("error", e.message);
        router.replace("/listings");
      });
  }, [ready, id, user, notify, router]);

  if (!listing) return null;

  // Cloudinary-style thumbnail param only applies to remote cloudinary URLs
  const thumb = listing.image.url.includes("/upload/") ? listing.image.url.replace("/upload", "/upload/w_250") : listing.image.url;

  return (
    <ListingForm
      mode="edit"
      cancelHref={`/listings/${id}`}
      currentImageUrl={thumb}
      initial={{
        title: listing.title,
        description: listing.description,
        location: listing.location,
        country: listing.country,
        price: String(listing.price),
      }}
      onSubmit={async (data) => {
        try {
          await api.updateListing(id, data);
          notify("success", "Listing Updated!");
          router.push(`/listings/${id}`);
        } catch (e) {
          notify("error", (e as Error).message);
        }
      }}
    />
  );
}
