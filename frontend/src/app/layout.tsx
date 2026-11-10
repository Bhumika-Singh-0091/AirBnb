import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./rating.css";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Flash from "@/components/Flash";

export const metadata: Metadata = {
  title: "WanderNest – Find Your Perfect Stay",
  description: "Discover, list and review unique stays around the world.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <Navbar />
          <div className="container">
            <Flash />
            {children}
          </div>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
