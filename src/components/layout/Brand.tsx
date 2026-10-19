// Style
import "./Brand.css";
// Config
import { siteConfig } from "@barito-bahalap/config";
// Hooks
import { useLocale } from "@/hooks/useLocale";
// Components
import { SmartLink } from "@/components";

interface BrandProps {
  onDark?: boolean;
  logo?: boolean;
  logoFull?: boolean;
}

const LOGO_SRC = {
  light: {
    icon: "/favicon.svg",
    full: "/favicon-alt.svg",
  },
  dark: {
    icon: "/favicon-inverted.svg",
    full: "/favicon-alt-inverted.svg",
  },
} as const;

export function Brand({
  onDark = false,
  logo = false,
  logoFull = false,
}: BrandProps) {
  const { href } = useLocale();

  if (logo) {
    const variant = onDark ? "dark" : "light";
    const type = logoFull ? "full" : "icon";

    return (
      <a href={href("/")}>
        <img
          src={LOGO_SRC[variant][type]}
          alt={siteConfig.name}
          className={`brand__bba-logo${logoFull ? " brand__bba-logo--full" : ""}`}
        />
      </a>
    );
  }

  return (
    <SmartLink
      href={href("/")}
      className={`brand${onDark ? " brand--on-dark" : ""}`}
    >
      <span className="brand__mark" aria-hidden="true">
        <span className="brand__dot" data-brand="tech" />
        <span className="brand__dot" data-brand="media" />
      </span>

      <span className="brand__text">
        <span className="brand__short">{siteConfig.shortName}</span>
        <span className="brand__name">{siteConfig.name}</span>
      </span>
    </SmartLink>
  );
}
