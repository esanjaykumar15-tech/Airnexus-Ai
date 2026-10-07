"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LocationContextValue {
  locationId: string;
  setLocationId: (id: string) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationId] = useState("delhi-ncr");
  return <LocationContext.Provider value={{ locationId, setLocationId }}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationContext must be used within LocationProvider");
  return ctx;
}
