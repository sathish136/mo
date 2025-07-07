import { useState, useEffect } from 'react';

interface LicenseState {
  licenseKey: string;
  isValid: boolean;
  expiryDate: Date | null;
  licensedTo: string;
  features: string[];
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseState>({
    licenseKey: '',
    isValid: false,
    expiryDate: null,
    licensedTo: '',
    features: []
  });

  useEffect(() => {
    // Load license from localStorage on mount
    const savedLicense = localStorage.getItem('systemLicense');
    if (savedLicense) {
      const parsed = JSON.parse(savedLicense);
      if (parsed.expiryDate) {
        parsed.expiryDate = new Date(parsed.expiryDate);
      }
      setLicense(parsed);
    }
  }, []);

  const validateLicense = (key: string): boolean => {
    // Simple validation - in production this would be server-side
    const isValid = key === 'MF-HR-2025-VALID-KEY';
    
    const newLicense: LicenseState = {
      licenseKey: key,
      isValid,
      licensedTo: isValid ? 'Ministry of Finance Sri Lanka' : '',
      expiryDate: isValid ? new Date('2025-12-31') : null,
      features: isValid ? ['HR Management', 'Attendance Tracking', 'Biometric Integration'] : []
    };

    setLicense(newLicense);
    localStorage.setItem('systemLicense', JSON.stringify(newLicense));
    
    return isValid;
  };

  const isFeatureEnabled = (feature: string): boolean => {
    return license.isValid && license.features.includes(feature);
  };

  const requiresLicense = (): boolean => {
    return !license.isValid;
  };

  return {
    license,
    validateLicense,
    isFeatureEnabled,
    requiresLicense
  };
}