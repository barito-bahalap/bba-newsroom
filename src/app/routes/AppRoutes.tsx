import { Suspense } from "react";
import { Outlet } from "react-router-dom";
// Layout & Components
import { Layout } from "@/components";
import { RequireAuth } from "@/components/module";
import { AuthLinkRedirect } from "./AuthLinkRedirect";
// Pages
import AccountPage from "@/pages/account/AccountPage";
import AuditLogPage from "@/pages/audit/AuditLogPage";
import ArticlesPage from "@/pages/article/ArticlesPage";
import ArticleEditorPage from "@/pages/article/ArticleEditorPage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import DashboardPage from "@/pages/home/DashboardPage";
import LoginPage from "@/pages/auth/LoginPage";
import NotFoundPage from "@/pages/404/NotFoundPage";
import SetPasswordPage from "@/pages/settings/SetPasswordPage";
import TeamPage from "@/pages/team/TeamPage";
// Utils
import { WRITE_ROLES } from "@/lib/permissions";

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
      { path: "login", element: <LoginPage /> },
      { path: "set-password", element: <SetPasswordPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <Layout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "articles", element: <ArticlesPage /> },
              {
                element: <RequireAuth roles={WRITE_ROLES} />,
                children: [
                  { path: "articles/new", element: <ArticleEditorPage /> },
                ],
              },
              { path: "articles/:id", element: <ArticleEditorPage /> },
              {
                element: <RequireAuth roles={["publisher"]} />,
                children: [{ path: "categories", element: <CategoriesPage /> }],
              },
              {
                element: <RequireAuth roles={["admin"]} />,
                children: [{ path: "team", element: <TeamPage /> }],
              },
              {
                element: <RequireAuth roles={["admin", "publisher"]} />,
                children: [{ path: "audit", element: <AuditLogPage /> }],
              },
              { path: "account", element: <AccountPage /> },
              { path: "*", element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];
