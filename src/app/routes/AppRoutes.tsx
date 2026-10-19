// Layout
import { Outlet } from "react-router-dom";
import { RootLayout } from "@/components/layout";
// i18n
import { DEFAULT_LOCALE, ENABLED_LOCALES } from "@/i18n/locales";
// Pages
import HomePage from "@/pages/home/HomePage";
import NotFoundPage from "@/pages/404/NotFoundPage";

// Fresh route objects per locale so each prefix gets its own tree.
const pageRoutes = () => [
  { index: true, element: <HomePage /> },
  //   { path: "about", element: <AboutPage /> },
];

export const appRoutes = [
  // Default locale lives at "/", every other enabled locale under "/<code>"
  { element: <RootLayout />, children: pageRoutes() },
  ...ENABLED_LOCALES.filter((code) => code !== DEFAULT_LOCALE).map((code) => ({
    path: code,
    element: <RootLayout />,
    children: pageRoutes(),
  })),
  {
    element: <Outlet />,
    children: [{ path: "*", element: <NotFoundPage /> }],
  },
];
