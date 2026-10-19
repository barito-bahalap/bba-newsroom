import { Outlet } from "react-router-dom";
// Style
import "./RootLayout.css";
// Components
import { ScrollToTop } from "@/components";
import { Footer, Header } from ".";

export function RootLayout() {
  return (
    <div className="app-shell" data-brand="media">
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="app-shell__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
