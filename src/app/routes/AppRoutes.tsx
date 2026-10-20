// Components
import { Layout, RequireAuth } from "@/components";
import { AuthShell } from ".";
// Pages
import AccountPage from "@/pages/account/AccountPage";
import ArticlesPage from "@/pages/article/ArticlesPage";
import ArticleEditorPage from "@/pages/article/ArticleEditorPage";
import AuditPage from "@/pages/audit/AuditPage";
import LoginPage from "@/pages/auth/LoginPage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import DashboardPage from "@/pages/home/DashboardPage";
import SetPasswordPage from "@/pages/settings/SetPasswordPage";
import TeamPage from "@/pages/team/TeamPage";
import NotFoundPage from "@/pages/404/NotFoundPage";
// Utils
import { WRITE_ROLES } from "@/lib";

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
                children: [{ path: "audit", element: <AuditPage /> }],
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
