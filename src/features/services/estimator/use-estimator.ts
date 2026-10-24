"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  type AddonId,
  type ProjectEstimatorCatalog,
  type SystemId,
} from "./catalog";
import { createProjectDetails, type ProjectDetails } from "./inquiry";
import {
  calculateEstimate,
  createEstimatorSelection,
  normalizeSelection,
  toggleSystem,
  type EstimatorSelection,
  type ProjectEstimate,
} from "./pricing";

type EstimatorState = {
  selection: EstimatorSelection;
  details: ProjectDetails;
  setDetails: Dispatch<SetStateAction<ProjectDetails>>;
  estimate: ProjectEstimate;
  patchSelection: (patch: Partial<EstimatorSelection>) => void;
  selectSystem: (id: SystemId) => void;
  selectAddon: (id: SystemId, addonId: AddonId) => void;
  reset: () => void;
};

export function useEstimator(catalog: ProjectEstimatorCatalog): EstimatorState {
  const [storedSelection, setSelection] = useState(createEstimatorSelection);
  const [details, setDetails] = useState(createProjectDetails);
  const selection = useMemo(
    () => normalizeSelection(storedSelection, catalog),
    [storedSelection, catalog],
  );
  const estimate = useMemo(
    () => calculateEstimate(selection, catalog),
    [selection, catalog],
  );

  function patchSelection(patch: Partial<EstimatorSelection>): void {
    setSelection((current) => ({
      ...normalizeSelection(current, catalog),
      ...patch,
    }));
  }
  function selectSystem(id: SystemId): void {
    setSelection((current) =>
      toggleSystem(normalizeSelection(current, catalog), id),
    );
  }
  function selectAddon(id: SystemId, addonId: AddonId): void {
    setSelection((current) => {
      const normalized = normalizeSelection(current, catalog);
      const addons = normalized.addons[id] ?? [];
      return {
        ...normalized,
        addons: {
          ...normalized.addons,
          [id]: addons.includes(addonId)
            ? addons.filter((item) => item !== addonId)
            : [...addons, addonId],
        },
      };
    });
  }
  function reset(): void {
    setSelection(createEstimatorSelection());
    setDetails(createProjectDetails());
  }
  return {
    selection,
    details,
    setDetails,
    estimate,
    patchSelection,
    selectSystem,
    selectAddon,
    reset,
  };
}
