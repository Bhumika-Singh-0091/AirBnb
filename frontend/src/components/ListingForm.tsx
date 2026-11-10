"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { ListingFormValues } from "@/lib/types";

interface Props {
  mode: "create" | "edit";
  initial?: ListingFormValues;
  currentImageUrl?: string;
  cancelHref: string;
  onSubmit: (data: FormData) => Promise<void>;
}

const EMPTY: ListingFormValues = { title: "", description: "", location: "", country: "", price: "" };

export default function ListingForm({ mode, initial = EMPTY, currentImageUrl, cancelHref, onSubmit }: Props) {
  const [values, setValues] = useState<ListingFormValues>(initial);
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const edit = mode === "edit";

  const set = (k: keyof ListingFormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }
    const data = new FormData(form); // picks up the file input too
    setBusy(true);
    try {
      await onSubmit(data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="row my-4">
      <div className="col-lg-8 offset-lg-2">
        <div className="form-section">
          <div className="listing-hero-tag mb-0">
            <i className={`fa-solid ${edit ? "fa-pen" : "fa-plus"}`}></i>
            {edit ? "Edit Listing" : "Create Listing"}
          </div>
          <h3 className="mt-2">{edit ? "Update Your Listing" : "List Your Place on WanderNest"}</h3>
          <p style={{ color: "#6B7280", marginBottom: "1.8rem" }}>
            {edit ? "Keep your listing fresh and accurate" : "Share your space with travelers from around the world"}
          </p>

          <form noValidate className={`needs-validation${validated ? " was-validated" : ""}`} onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">📝 Title</label>
              <input name="title" type="text" className="form-control" required value={values.title}
                onChange={set("title")} placeholder="e.g. Cozy beachfront villa with ocean views" />
              <div className="valid-feedback">Looks great!</div>
              <div className="invalid-feedback">Please add a title.</div>
            </div>

            <div className="mb-3">
              <label className="form-label">📖 Description</label>
              <textarea name="description" className="form-control" rows={4} required value={values.description}
                onChange={set("description")} placeholder="Describe what makes your place special…" />
              <div className="invalid-feedback">Please add a description.</div>
            </div>

            {edit && currentImageUrl && (
              <div className="mb-3">
                <label className="form-label">Current Image</label>
                <div style={{ borderRadius: 12, overflow: "hidden", maxWidth: 300 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentImageUrl} style={{ width: "100%", objectFit: "cover", borderRadius: 12 }} alt="Current" />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">🖼️ {edit ? "Replace Image" : "Upload Image"}</label>
              <input name="image" type="file" className="form-control" accept="image/png,image/jpeg,image/webp" />
              <div style={{ fontSize: "0.8rem", color: "#9CA3AF", marginTop: 4 }}>
                {edit ? "Leave blank to keep current image. " : ""}JPG, PNG or WEBP. Max 5MB.
              </div>
            </div>

            <div className="row">
              <div className="col-md-5 mb-3">
                <label className="form-label">💰 Price per Night (₹)</label>
                <input name="price" type="number" className="form-control" required min={0} step={1}
                  value={values.price} onChange={set("price")} placeholder="e.g. 3500" />
                <div className="invalid-feedback">Enter a valid price.</div>
              </div>
              <div className="col-md-7 mb-3">
                <label className="form-label">🌏 Country</label>
                <input name="country" type="text" className="form-control" required value={values.country}
                  onChange={set("country")} placeholder="e.g. India" />
                <div className="invalid-feedback">Country is required.</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">📍 Location / City</label>
              <input name="location" type="text" className="form-control" required value={values.location}
                onChange={set("location")} placeholder="e.g. Goa, India" />
              <div className="invalid-feedback">Location is required.</div>
            </div>

            <div className="d-flex gap-3">
              <button className="btn btn-primary-wn" disabled={busy}>
                <i className={`fa-solid ${edit ? "fa-floppy-disk" : "fa-house-chimney"} me-2`}></i>
                {busy ? "Saving…" : edit ? "Save Changes" : "Publish Listing"}
              </button>
              <Link href={cancelHref} className="btn btn-outline-wn">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
