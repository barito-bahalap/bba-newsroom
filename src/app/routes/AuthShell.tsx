import { Suspense } from "react";
import { Outlet } from "react-router-dom";
// Components
import { LoadingSpinner } from "@/components";
import { AuthLinkRedirect } from ".";

export function AuthShell() {
  return (
    <>
      <AuthLinkRedirect />
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </>
  );
}
