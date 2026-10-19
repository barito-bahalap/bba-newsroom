import type * as en from "@/data/en";

type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { readonly [K in keyof T]: Widen<T[K]> }
          : T;

// English defines the shape; other locales must match it with different strings.
export type ContentBundle = Widen<
  Omit<typeof en, "locale" | "isDefaultLocale">
>;
