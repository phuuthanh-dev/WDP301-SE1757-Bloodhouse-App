import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FacilityContext = createContext();
const FACILITY_STORAGE_KEY = '@facility_data';

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};

export const FacilityProvider = ({ children }) => {
  const [facilityData, setFacilityData] = useState({
    facilityId: null,
    position: '',
    facilityName: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load facility data from AsyncStorage when app starts
  useEffect(() => {
    loadFacilityData();
  }, []);

  const loadFacilityData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(FACILITY_STORAGE_KEY);
      if (storedData) {
        setFacilityData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading facility data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFacilityData = async (data) => {
    try {
      const newData = {
        ...facilityData,
        ...data
      };
      setFacilityData(newData);
      await AsyncStorage.setItem(FACILITY_STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving facility data:', error);
    }
  };

  const clearFacilityData = async () => {
    try {
      const emptyData = {
        facilityId: null,
        position: '',
        facilityName: '',
      };
      setFacilityData(emptyData);
      await AsyncStorage.removeItem(FACILITY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing facility data:', error);
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <FacilityContext.Provider 
      value={{ 
        ...facilityData, 
        updateFacilityData,
        clearFacilityData
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
}; 