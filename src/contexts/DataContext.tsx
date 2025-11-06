import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface Protocol {
  id: string;
  label: string;
  color: string;
  weight: number;
  notes: string;
}

export interface Profile {
  id: string;
  name: string;
  months: {
    [monthKey: string]: MonthData;
  };
}

export interface MonthData {
  protocols: Protocol[];
  cells: {
    [key: string]: boolean | string;
  };
}

export interface TrackerData {
  schemaVersion: number;
  profiles: {
    [profileId: string]: Profile;
  };
  settings: {
    activeProfile: string;
    theme: string;
  };
}

interface DataContextType {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  currentProfile: Profile;
  protocols: Protocol[];
  addProtocol: (label: string, color: string, weight?: number) => void;
  removeProtocol: (id: string) => void;
  editProtocol: (id: string, label: string, color: string, weight?: number) => void;
  toggleCell: (day: number, protocolId: string) => void;
  setCellValue: (day: number, protocolId: string, value: boolean) => void;
  getCellValue: (day: number, protocolId: string) => boolean;
  setSleepHours: (day: number, hours: string) => void;
  getSleepHours: (day: number) => string | undefined;
  setCellNote: (day: number, protocolId: string, note: string) => void;
  getCellNote: (day: number, protocolId: string) => string;
  getCompletionCount: (protocolId: string) => number;
  exportData: () => string;
  importData: (jsonString: string) => void;
  clearMonthData: () => void;
  clearAllData: () => void;
  data: TrackerData;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultColors = [
  '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
  '#ef4444', '#14b8a6', '#6366f1', '#84cc16', '#f97316'
];

const initialData: TrackerData = {
  schemaVersion: 1,
  profiles: {
    default: {
      id: 'default',
      name: 'My Tracker',
      months: {}
    }
  },
  settings: {
    activeProfile: 'default',
    theme: 'dark'
  }
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentMonth, setCurrentMonthState] = React.useState(new Date());
  const [rawData, setRawData] = useLocalStorage<TrackerData>('tracker-data-v2', initialData);
  
  // Validate and normalize data structure
  const data = React.useMemo(() => {
    if (!rawData || typeof rawData !== 'object') {
      return initialData;
    }
    
    // Ensure required properties exist
    const normalized: TrackerData = {
      schemaVersion: rawData.schemaVersion || 1,
      profiles: rawData.profiles || initialData.profiles,
      settings: rawData.settings || initialData.settings
    };
    
    // Ensure default profile exists
    if (!normalized.profiles.default) {
      normalized.profiles.default = initialData.profiles.default;
    }
    
    return normalized;
  }, [rawData]);
  
  const setData = React.useCallback((value: TrackerData | ((prev: TrackerData) => TrackerData)) => {
    setRawData(value);
  }, [setRawData]);

  const getMonthKey = useCallback((date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth, getMonthKey]);
  const activeProfileId = data.settings.activeProfile;

  // Ensure month exists when it changes - but only run once per monthKey
  useEffect(() => {
    setData(prev => {
      const profile = prev.profiles[activeProfileId] || prev.profiles.default;
      
      // Check if month already exists
      if (profile.months[monthKey]) {
        return prev; // Already exists, don't update
      }

      // Month doesn't exist, create it
      const previousMonths = Object.keys(profile.months).sort().reverse();
      let initialProtocols: Protocol[] = [];

      if (previousMonths.length > 0) {
        initialProtocols = profile.months[previousMonths[0]].protocols;
      }

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                protocols: initialProtocols,
                cells: {}
              }
            }
          }
        }
      };
    });
  }, [monthKey, activeProfileId, setData]);

  const currentProfile = useMemo(() => 
    data.profiles[activeProfileId] || data.profiles.default,
    [data.profiles, activeProfileId]
  );

  const currentMonthData = useMemo(() => 
    currentProfile.months[monthKey] || { protocols: [], cells: {} },
    [currentProfile.months, monthKey]
  );

  const protocols = currentMonthData.protocols;

  const setCurrentMonth = useCallback((date: Date) => {
    setCurrentMonthState(date);
  }, []);

  const addProtocol = useCallback((label: string, color: string, weight: number = 1) => {
    const newProtocol: Protocol = {
      id: `protocol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label,
      color: color || defaultColors[protocols.length % defaultColors.length],
      weight,
      notes: ''
    };

    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };
      
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                ...monthData,
                protocols: [...monthData.protocols, newProtocol]
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, protocols.length, setData]);

  const removeProtocol = useCallback((id: string) => {
    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };
      
      const updatedCells = { ...monthData.cells };
      Object.keys(updatedCells).forEach(key => {
        if (key.includes(id)) {
          delete updatedCells[key];
        }
      });

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                protocols: monthData.protocols.filter(p => p.id !== id),
                cells: updatedCells
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, setData]);

  const editProtocol = useCallback((id: string, label: string, color: string, weight: number = 1) => {
    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                ...monthData,
                protocols: monthData.protocols.map(p =>
                  p.id === id ? { ...p, label, color, weight } : p
                )
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, setData]);

  const getCellKey = useCallback((day: number, protocolId: string) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return `${protocolId}::${dateStr}`;
  }, [currentMonth]);

  const toggleCell = useCallback((day: number, protocolId: string) => {
    const key = getCellKey(day, protocolId);
    
    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };
      const currentValue = monthData.cells[key];

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                ...monthData,
                cells: {
                  ...monthData.cells,
                  [key]: !currentValue
                }
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, getCellKey, setData]);

  const setCellValue = useCallback((day: number, protocolId: string, value: boolean) => {
    const key = getCellKey(day, protocolId);

    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                ...monthData,
                cells: {
                  ...monthData.cells,
                  [key]: value
                }
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, getCellKey, setData]);

  const getCellValue = useCallback((day: number, protocolId: string): boolean => {
    const key = getCellKey(day, protocolId);
    return !!currentMonthData.cells[key];
  }, [currentMonthData.cells, getCellKey]);

  const setSleepHours = useCallback((day: number, hours: string) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const key = `sleep::${dateStr}`;
    
    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                ...monthData,
                cells: {
                  ...monthData.cells,
                  [key]: hours
                }
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, currentMonth, setData]);

  const getSleepHours = useCallback((day: number): string | undefined => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const key = `sleep::${dateStr}`;
    const value = currentMonthData.cells[key];
    return typeof value === 'string' ? value : undefined;
  }, [currentMonthData.cells, currentMonth]);

  const setCellNote = useCallback((day: number, protocolId: string, note: string) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const key = `note::${protocolId}::${dateStr}`;
    
    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                ...monthData,
                cells: {
                  ...monthData.cells,
                  [key]: note
                }
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, currentMonth, setData]);

  const getCellNote = useCallback((day: number, protocolId: string): string => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const key = `note::${protocolId}::${dateStr}`;
    const value = currentMonthData.cells[key];
    return typeof value === 'string' ? value : '';
  }, [currentMonthData.cells, currentMonth]);

  const getCompletionCount = useCallback((protocolId: string): number => {
    return Object.keys(currentMonthData.cells).filter(key => {
      return key.startsWith(`${protocolId}::`) && currentMonthData.cells[key] === true;
    }).length;
  }, [currentMonthData.cells]);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonString: string) => {
    try {
      const importedData = JSON.parse(jsonString);
      setData(importedData);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }, [setData]);

  const clearMonthData = useCallback(() => {
    setData(prev => {
      const profile = prev.profiles[activeProfileId];
      const monthData = profile.months[monthKey] || { protocols: [], cells: {} };

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [activeProfileId]: {
            ...profile,
            months: {
              ...profile.months,
              [monthKey]: {
                protocols: monthData.protocols,
                cells: {}
              }
            }
          }
        }
      };
    });
  }, [activeProfileId, monthKey, setData]);

  const clearAllData = useCallback(() => {
    setData(initialData);
  }, [setData]);

  return (
    <DataContext.Provider
      value={{
        currentMonth,
        setCurrentMonth,
        currentProfile,
        protocols,
        addProtocol,
        removeProtocol,
        editProtocol,
        toggleCell,
        setCellValue,
        getCellValue,
        setSleepHours,
        getSleepHours,
        setCellNote,
        getCellNote,
        getCompletionCount,
        exportData,
        importData,
        clearMonthData,
        clearAllData,
        data
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
