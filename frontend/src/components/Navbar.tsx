"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const { user, logout, notify } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => setOpen(false), [pathname]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/listings?q=${encodeURIComponent(q.trim())}` : "/listings");
  };

  const onLogout = async () => {
    await logout();
    notify("success", "You are logged out now");
    router.push("/listings");
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid px-4">
        <Link className="navbar-brand" href="/listings">
          <div className="brand-icon">
            <i className="fa-solid fa-location-dot"></i>
          </div>
          WanderNest
        </Link>

        <button className="navbar-toggler border-0" type="button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${open ? " show" : ""}`} id="navMain">
          <ul className="navbar-nav me-auto ms-3 gap-1">
            <li className="nav-item">
              <Link className="nav-link" href="/listings">
                <i className="fa-solid fa-compass me-1"></i>Explore
              </Link>
            </li>
          </ul>

          <form className="d-flex align-items-center me-3" role="search" onSubmit={onSearch}>
            <div className="search-wrapper">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                className="search-input"
                type="search"
                name="q"
                placeholder="Search destinations…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </form>

          <ul className="navbar-nav gap-2 align-items-center">
            <li className="nav-item">
              <Link className="nav-link" href="/listings/new">
                <i className="fa-solid fa-plus me-1"></i>List a place
              </Link>
            </li>
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="btn btn-nav-outline" href="/signup">Sign Up</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-nav-primary" href="/login">Log In</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link fw-semibold text-muted" style={{ fontSize: "0.9rem" }}>
                    <i className="fa-regular fa-circle-user me-1"></i>
                    {user.username}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-nav-outline" onClick={onLogout}>Log Out</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
