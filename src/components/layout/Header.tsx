import { NavLink } from "react-router-dom";
// Style
import "./Header.css";
// Utils
import type { NavItem } from "@/lib";

interface HeaderProps {
  links: NavItem[];
  userLabel: string;
  onSignOut: () => void;
}

export function Header({ links, userLabel, onSignOut }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        <strong className="header__brand">BBM Newsroom</strong>
        <nav className="header__nav" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="header__link"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="header__user">
          <span className="header__who">{userLabel}</span>
          <button type="button" className="btn btn--sm" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
