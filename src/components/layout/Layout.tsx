import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABEL } from "@/lib/format";
import { can } from "@/lib/permissions";

export function Layout() {
  const { profile, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!profile) return null;

  const links: { to: string; label: string; end?: boolean }[] = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/articles", label: "Articles", end: true },
  ];
  if (can.writeArticles(profile.role))
    links.push({ to: "/articles/new", label: "Write" });
  if (can.manageCategories(profile.role))
    links.push({ to: "/categories", label: "Categories" });
  if (can.manageTeam(profile.role)) links.push({ to: "/team", label: "Team" });
  if (can.viewAudit(profile.role))
    links.push({ to: "/audit", label: "Audit log" });
  links.push({ to: "/account", label: "Account" });

  async function handleSignOut() {
    await signOut();
    queryClient.clear();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="app">
        <strong>BBM Newsroom</strong>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <span>
          {profile.full_name || profile.email} ({ROLE_LABEL[profile.role]})
        </span>
        <button type="button" onClick={() => void handleSignOut()}>
          Sign out
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
