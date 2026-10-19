import { useRoutes } from "react-router-dom";
import { appRoutes } from "./AppRoutes";

export function AppRouter() {
  return useRoutes(appRoutes);
}
