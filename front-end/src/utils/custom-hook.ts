import React, { useState, useEffect } from "react"

export const debounce = (value: string, time: number): string => {
    const [debouncedValue, setDebouncedValue] = useState<string>(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, time);
      return () => {
        clearTimeout(handler); 
      };
    }, [value])
  return debouncedValue;
  }