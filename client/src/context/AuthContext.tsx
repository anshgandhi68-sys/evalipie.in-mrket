import React, { createContext, useContext, useState } from 'react';

export type UserPersona = 'CUSTOMER' | 'MERCHANT_INDEPENDENT' | 'MERCHANT_CHAIN' | 'ADMIN';

interface AuthContextType {
  persona: UserPersona;
  setPersona: (p: UserPersona) => void;
  activeOrgId: string;
  activeCity: string;
  setActiveCity: (c: string) => void;
  personaLabel: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<UserPersona>('CUSTOMER');
  const [activeCity, setActiveCity] = useState<string>('Bengaluru');

  const activeOrgId = persona === 'MERCHANT_INDEPENDENT' 
    ? 'org-sharma' 
    : persona === 'MERCHANT_CHAIN' 
    ? 'org-citysuper' 
    : 'org-sharma';

  const personaLabel = persona === 'CUSTOMER'
    ? 'Shopper (Bengaluru)'
    : persona === 'MERCHANT_INDEPENDENT'
    ? 'Sharma Electronics (Shopkeeper)'
    : persona === 'MERCHANT_CHAIN'
    ? 'City Supermarket (Chain Manager)'
    : 'Platform Administrator';

  return (
    <AuthContext.Provider
      value={{
        persona,
        setPersona,
        activeOrgId,
        activeCity,
        setActiveCity,
        personaLabel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
