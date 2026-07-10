// src/context/LoadingContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from '../components/common/Loader';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [loadingVariant, setLoadingVariant] = useState('warm');
  const [loadingSize, setLoadingSize] = useState('md');

  const showLoading = useCallback((message = 'Loading...', variant = 'warm', size = 'md') => {
    setLoadingMessage(message);
    setLoadingVariant(variant);
    setLoadingSize(size);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async (fn, message = 'Loading...', variant = 'warm', size = 'md') => {
    try {
      showLoading(message, variant, size);
      const result = await fn();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      showLoading, 
      hideLoading, 
      withLoading,
      loadingMessage,
      loadingVariant,
      loadingSize
    }}>
      <AnimatePresence>
        {isLoading && (
          <Loader 
            message={loadingMessage}
            variant={loadingVariant}
            size={loadingSize}
            fullScreen={true}
          />
        )}
      </AnimatePresence>
      {children}
    </LoadingContext.Provider>
  );
};