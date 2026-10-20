import { Outlet } from "react-router-dom";
// Style
import "./Layout.css";
// Hooks
import { useLayoutNav } from "@/hooks";
// Components
import { Header } from "./Header";
// Utils
import { ROLE_LABEL } from "@/lib";

export function Layout() {
  const { profile, links, signOut } = useLayoutNav();

  if (!profile) return null;

  return (
    <div className="layout">
      <Header
        links={links}
        userLabel={`${profile.full_name || profile.email} (${ROLE_LABEL[profile.role]})`}
        onSignOut={() => void signOut()}
      />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
