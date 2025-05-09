"use client";
import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext<{ searchTerm: string; setSearchTerm: React.Dispatch<React.SetStateAction<string>> } | null>(null);

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};
