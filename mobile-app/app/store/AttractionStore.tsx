import React, { createContext, useContext, useState } from "react";

type GlobalStore = {
  selectedAttractions: Attraction[];
  setSelectedAttractions: (value: Attraction[]) => void;
};

const StoreContext = createContext<GlobalStore | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>(
    []
  );

  const value: GlobalStore = {
    selectedAttractions,
    setSelectedAttractions,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
