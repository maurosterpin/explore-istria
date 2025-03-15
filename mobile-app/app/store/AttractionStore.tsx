import React, { createContext, useContext, useState } from "react";

type GlobalStore = {
  selectedAttractions: Attraction[];
  setSelectedAttractions: (value: Attraction[]) => void;
  selectedCity: string | null;
  setSelectedCity: (value: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
};

const StoreContext = createContext<GlobalStore | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const value: GlobalStore = {
    selectedAttractions,
    setSelectedAttractions,
    selectedCategory,
    setSelectedCategory,
    selectedCity,
    setSelectedCity,
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
