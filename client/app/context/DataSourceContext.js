import React, { createContext, useState } from 'react';

export const BaseContext = createContext();

export const BaseProvider = ({ children }) => {
  const [base, setBase] = useState("hey there");

  return (
    <BaseContext.Provider value={{ base, setBase }}>
      {children}
    </BaseContext.Provider>
  );
};