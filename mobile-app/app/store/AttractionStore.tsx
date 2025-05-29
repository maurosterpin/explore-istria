import React, { createContext, useContext, useState } from "react";

type GlobalStore = {
  routeAttractions: Attraction[];
  setRouteAttractions: (value: Attraction[]) => void;
  selectedAttractions: Attraction[];
  setSelectedAttractions: (value: Attraction[]) => void;
  selectedCity: string | null;
  setSelectedCity: (value: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  username: string | null;
  setUsername: (value: string | null) => void;
  userId: number | null;
  setUserId: (value: number | null) => void;
  userUpvotedRoutes: number[] | null;
  setUserUpvotedRoutes: (value: number[] | null) => void;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  modalState: "Edit" | "Add";
  setModalState: (value: "Edit" | "Add") => void;
  modalType: "Attraction" | "Route";
  setModalType: (value: "Attraction" | "Route") => void;
  userLat: number | undefined;
  setUserLat: (value: number | undefined) => void;
  userLng: number | undefined;
  setUserLng: (value: number | undefined) => void;
  travelMode: string;
  setTravelMode: (value: string) => void;
};

const StoreContext = createContext<GlobalStore | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>(
    []
  );
  const [routeAttractions, setRouteAttractions] = useState<Attraction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userUpvotedRoutes, setUserUpvotedRoutes] = useState<number[] | null>(
    null
  );
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalState, setModalState] = useState<"Edit" | "Add">("Add");
  const [modalType, setModalType] = useState<"Attraction" | "Route">(
    "Attraction"
  );
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);

  const [travelMode, setTravelMode] = useState<string>("foot-walking");

  const value: GlobalStore = {
    routeAttractions,
    setRouteAttractions,
    selectedAttractions,
    setSelectedAttractions,
    selectedCategory,
    setSelectedCategory,
    selectedCity,
    setSelectedCity,
    isLoggedIn,
    setIsLoggedIn,
    username,
    setUsername,
    userId,
    setUserId,
    userUpvotedRoutes,
    setUserUpvotedRoutes,
    openModal,
    setOpenModal,
    modalState,
    setModalState,
    modalType,
    setModalType,
    userLat,
    setUserLat,
    userLng,
    setUserLng,
    travelMode,
    setTravelMode,
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
