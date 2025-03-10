import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface XPContextType {
  totalXP: number;
  addXP: (amount: number) => void;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

// Move this outside the component to prevent recreation on each render
const getInitialXP = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("totalXP");
    return saved ? parseInt(saved, 10) : 0;
  }
  return 0;
};

export function XPProvider({ children }: { children: ReactNode }) {
  const [totalXP, setTotalXP] = useState(getInitialXP);

  const addXP = useCallback((amount: number) => {
    setTotalXP((prev) => {
      const newTotal = prev + amount;
      localStorage.setItem("totalXP", newTotal.toString());
      return newTotal;
    });
  }, []);

  return (
    <XPContext.Provider value={{ totalXP, addXP }}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error("useXP must be used within an XPProvider");
  }
  return context;
}
