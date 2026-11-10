"use client";

import { useRouter } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { useRequireLogin } from "@/lib/useRequireLogin";

export default function NewListingPage() {
  const { ready } = useRequireLogin();
  const { notify } = useApp();
  const router = useRouter();

  if (!ready) return null;

  return (
    <ListingForm
      mode="create"
      cancelHref="/listings"
      onSubmit={async (data) => {
        try {
          const created = await api.createListing(data);
          notify("success", "New Listing Created!");
          router.push(`/listings/${created.id}`);
        } catch (e) {
          notify("error", "Error creating listing: " + (e as Error).message);
        }
      }}
    />
  );
}
