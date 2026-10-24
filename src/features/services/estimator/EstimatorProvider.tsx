"use client";

import { createContext, useContext, type ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/brand";
import {
  defaultEstimatorCatalog,
  type ProjectEstimatorCatalog,
} from "./catalog";

type EstimatorConfig = {
  catalog: ProjectEstimatorCatalog;
  contactEmail: string;
};
const EstimatorContext = createContext<EstimatorConfig>({
  catalog: defaultEstimatorCatalog,
  contactEmail: CONTACT_EMAIL,
});

export function EstimatorProvider({
  catalog,
  contactEmail,
  children,
}: EstimatorConfig & { children: ReactNode }): ReactNode {
  return (
    <EstimatorContext.Provider value={{ catalog, contactEmail }}>
      {children}
    </EstimatorContext.Provider>
  );
}

export function useEstimatorConfig(): EstimatorConfig {
  return useContext(EstimatorContext);
}
