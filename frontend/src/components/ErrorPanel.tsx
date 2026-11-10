import Link from "next/link";

export default function ErrorPanel({ message }: { message: string }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "3rem" }}>
      <div>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>😕</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.5rem", color: "#1E1B4B", marginBottom: "0.5rem" }}>Oops!</h1>
        <p style={{ color: "#6B7280", fontSize: "1.1rem", marginBottom: "2rem" }}>{message}</p>
        <Link href="/listings" className="btn btn-primary-wn">
          <i className="fa-solid fa-house me-2"></i>Back to Home
        </Link>
      </div>
    </div>
  );
}
