import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { formatErr } from '../lib/api';
import { Service } from '../types';
import { toast } from 'sonner';

interface ServiceContextType {
  services: Service[];
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  selectedService: Service | null;
  loading: boolean;
  fetchServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceIdState] = useState<string>(() => {
    return localStorage.getItem('vauth_selected_service_id') || 'all';
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      const loadedServices: Service[] = res.data || [];
      setServices(loadedServices);

      // Validate selectedServiceId
      const savedId = localStorage.getItem('vauth_selected_service_id') || 'all';
      if (savedId !== 'all' && !loadedServices.some((s) => s.id === savedId)) {
        if (loadedServices.length > 0) {
          setSelectedServiceIdState('all');
          localStorage.setItem('vauth_selected_service_id', 'all');
        }
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(() => {
      fetchServices();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const setSelectedServiceId = (id: string) => {
    setSelectedServiceIdState(id);
    localStorage.setItem('vauth_selected_service_id', id);
  };

  const selectedService = services.find((s) => s.id === selectedServiceId) || null;

  return (
    <ServiceContext.Provider
      value={{
        services,
        selectedServiceId,
        setSelectedServiceId,
        selectedService,
        loading,
        fetchServices,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
