import Link from "next/link";

export default function Footer() {
  return (
    <footer className="wn-footer">
      <div className="container">
        <div className="row gy-3 align-items-start">
          <div className="col-md-4">
            <div className="footer-logo">
              <i className="fa-solid fa-location-dot"></i>
              <span>WanderNest</span>
            </div>
            <div className="footer-desc">
              Discover extraordinary places to stay around the world. From cozy cottages to luxury villas.
            </div>
          </div>
          <div className="col-md-4">
            <div style={{ color: "white", fontWeight: 600, marginBottom: "0.6rem" }}>Quick Links</div>
            <div className="footer-links">
              <Link href="/listings">Explore</Link>
              <Link href="/listings/new">List a Place</Link>
              <Link href="/signup">Sign Up</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div style={{ color: "white", fontWeight: 600, marginBottom: "0.6rem" }}>Follow Us</div>
            <div className="footer-social">
              <i className="fa-brands fa-instagram"></i>
              <i className="fa-brands fa-twitter"></i>
              <i className="fa-brands fa-facebook"></i>
              <i className="fa-brands fa-linkedin"></i>
            </div>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-bottom d-flex justify-content-between flex-wrap gap-2">
          <span>&copy; 2025 WanderNest Private Limited. All rights reserved.</span>
          <span>
            <a href="#" style={{ color: "#A78BFA", textDecoration: "none", marginRight: "1rem" }}>Privacy</a>
            <a href="#" style={{ color: "#A78BFA", textDecoration: "none" }}>Terms</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
