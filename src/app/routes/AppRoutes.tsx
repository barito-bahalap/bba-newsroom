import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
// Layout & Components
import { Layout } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { AuthLinkRedirect } from "./AuthLinkRedirect";
// Pages
import Account from "@/pages/Account";
import AuditLog from "@/pages/AuditLog";
import Articles from "@/pages/Articles";
import Categories from "@/pages/Categories";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import SetPassword from "@/pages/SetPassword";
import Team from "@/pages/Team";
// Utils
import { WRITE_ROLES } from "@/lib/permissions";

const ArticleEditor = lazy(() => import("@/pages/ArticleEditor"));

// Must live inside the router, because AuthLinkRedirect uses useNavigate.
function AuthShell() {
  return (
    <>
      <AuthLinkRedirect />
      <Suspense fallback={<p className="center">Loading...</p>}>
        <Outlet />
      </Suspense>
    </>
  );
}

export const appRoutes = [
  {
    element: <AuthShell />,
    children: [
      { path: "login", element: <Login /> },
      { path: "set-password", element: <SetPassword /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <Layout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: "articles", element: <Articles /> },
              {
                element: <RequireAuth roles={WRITE_ROLES} />,
                children: [
                  { path: "articles/new", element: <ArticleEditor /> },
                ],
              },
              { path: "articles/:id", element: <ArticleEditor /> },
              {
                element: <RequireAuth roles={["publisher"]} />,
                children: [{ path: "categories", element: <Categories /> }],
              },
              {
                element: <RequireAuth roles={["admin"]} />,
                children: [{ path: "team", element: <Team /> }],
              },
              {
                element: <RequireAuth roles={["admin", "publisher"]} />,
                children: [{ path: "audit", element: <AuditLog /> }],
              },
              { path: "account", element: <Account /> },
              { path: "*", element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
];
