import { createContext, useContext, useState, ReactNode } from 'react';

interface XPContextType {
  totalXP: number;
  addXP: (amount: number) => void;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function XPProvider({ children }: { children: ReactNode }) {
  const [totalXP, setTotalXP] = useState(() => {
    // Try to load saved XP from localStorage
    const saved = localStorage.getItem('totalXP');
    return saved ? parseInt(saved, 10) : 0;
  });

  const addXP = (amount: number) => {
    setTotalXP(prev => {
      const newTotal = prev + amount;
      localStorage.setItem('totalXP', newTotal.toString());
      return newTotal;
    });
  };

  return (
    <XPContext.Provider value={{ totalXP, addXP }}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
} 