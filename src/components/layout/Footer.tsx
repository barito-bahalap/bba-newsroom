// Style
import "./Footer.css";
// Hooks
import { useSiteContent } from "@/hooks";
// Components
import { SmartLink } from "@/components";
import { Brand } from "./Brand";

export function Footer() {
  const { site, footerGroups, layout } = useSiteContent();

  return (
    <footer className="footer">
      <div className="vt-wrap footer__top">
        <div className="footer__about">
          <Brand logo logoFull />
          <p className="footer__text">
            {site.tagline}. {site.location}.
          </p>
          <p className="footer__text">
            {site.name} |{" "}
            <a href={site.holdingUrl} rel="noopener noreferrer">
              {layout.footer.parentLabel}
            </a>
            .
          </p>
          <nav aria-label={layout.footer.contactLabel}>
            <a className="footer__mail" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </nav>
        </div>

        {footerGroups.map((group) => (
          <nav
            key={group.title}
            className="footer__group"
            aria-label={group.title}
          >
            <h2 className="footer__heading">{group.title}</h2>
            <ul className="footer__list">
              {group.links.map((link) => (
                <li key={link.href}>
                  <SmartLink href={link.href}>{link.label}</SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="vt-wrap footer__legal">
        <p>
          &copy; {new Date().getFullYear()} {site.holdingName}.{" "}
          {layout.footer.rights}
        </p>
      </div>
    </footer>
  );
}
