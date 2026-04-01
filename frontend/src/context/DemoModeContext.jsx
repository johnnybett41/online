import { createContext, useContext, useEffect, useState } from 'react';

const DemoModeContext = createContext();
const DEMO_MODE_KEY = 'electrohub_demo_mode_v1';

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem(DEMO_MODE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
    } catch (error) {
      console.warn('Unable to persist demo mode preference:', error);
    }
  }, [isDemoMode]);

  const enableDemoMode = () => setIsDemoMode(true);
  const disableDemoMode = () => setIsDemoMode(false);
  const toggleDemoMode = () => setIsDemoMode((current) => !current);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        enableDemoMode,
        disableDemoMode,
        toggleDemoMode,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
};
