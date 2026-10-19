import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
// Style
import "./Header.css";
// Hooks
import { useHeaderDrawer, useLanguageSwitch, useSiteContent } from "@/hooks";
// Components
import { Button, LanguageSwitcher, SmartLink } from "@/components";
import { Brand } from "./Brand";

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

export function Header() {
  const { mainNav, headerCta, footerGroups, layout } = useSiteContent();
  const languageItems = useLanguageSwitch();
  const { pathname } = useLocation();
  const { open, triggerRef, closeRef, openDrawer, closeDrawer, dismissDrawer } =
    useHeaderDrawer();

  const isActive = (target: string) => {
    const current = normalize(pathname);
    const destination = normalize(target);

    return (
      current === destination ||
      (destination !== "/" && current.startsWith(`${destination}/`))
    );
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Brand logo />

        <nav className="header__nav" aria-label={layout.menu.primaryNav}>
          {mainNav.map((item) => (
            <SmartLink
              key={item.href}
              href={item.href}
              className="header__link"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </SmartLink>
          ))}
        </nav>

        <div className="header__end">
          <div className="header__lang">
            <LanguageSwitcher
              items={languageItems}
              label={layout.language.label}
            />
          </div>
          <div className="header__cta">
            <Button
              label={headerCta.label}
              href={headerCta.href}
              variant="primary"
              brand="media"
              size="sm"
            />
          </div>
          <button
            ref={triggerRef}
            type="button"
            className="header__trigger"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={openDrawer}
          >
            {layout.menu.open}
          </button>
        </div>
      </div>

      {open &&
        createPortal(
          <div
            id="mobile-drawer"
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={layout.menu.mobileNav}
          >
            <div className="drawer__bar">
              <Brand logo />
              <button
                ref={closeRef}
                type="button"
                className="header__trigger"
                onClick={dismissDrawer}
              >
                {layout.menu.close}
              </button>
            </div>

            <nav className="drawer__nav" aria-label={layout.menu.mobileNav}>
              {footerGroups.map((group) => (
                <section key={group.title} className="drawer__group">
                  <h2 className="drawer__heading">{group.title}</h2>
                  <ul className="drawer__list">
                    {group.links.map((item) => (
                      <li key={item.href}>
                        <SmartLink
                          href={item.href}
                          className="drawer__link"
                          aria-current={
                            isActive(item.href) ? "page" : undefined
                          }
                          onClick={closeDrawer}
                        >
                          {item.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>

            <div className="drawer__foot">
              <LanguageSwitcher
                items={languageItems}
                label={layout.language.label}
              />
              <Button
                label={headerCta.label}
                href={headerCta.href}
                variant="primary"
                brand="media"
                fullWidth
                onClick={closeDrawer}
              />
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
