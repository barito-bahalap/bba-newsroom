import { createContext } from "react";
import type { AuthValue } from "./useAuth";

export const AuthContext = createContext<AuthValue | null>(null);
