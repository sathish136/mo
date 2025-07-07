import { useState, useEffect } from 'react';

interface LicenseState {
  licenseKey: string;
  isValid: boolean;
  expiryDate: Date | null;
  licensedTo: string;
  features: string[];
  tier: string;
  maxWebLogins: number;
  currentLogins: number;
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseState>({
    licenseKey: '',
    isValid: false,
    expiryDate: null,
    licensedTo: '',
    features: [],
    tier: '',
    maxWebLogins: 0,
    currentLogins: 0
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
    // Define license tiers with specific configurations
    const licenseConfigs: Record<string, Omit<LicenseState, 'licenseKey' | 'currentLogins'>> = {
      'J7K9-P2Q4-R6T8-U1V3': {
        isValid: true,
        licensedTo: 'Ministry of Finance Sri Lanka',
        expiryDate: new Date('2025-12-31'),
        features: ['HR Management', 'Attendance Tracking', 'Biometric Integration', 'Reports', 'Advanced Analytics'],
        tier: 'Enterprise Pro',
        maxWebLogins: 2
      },
      'M5N7-B8C2-L4X6-W9Z0': {
        isValid: true,
        licensedTo: 'Ministry of Finance Sri Lanka',
        expiryDate: new Date('2025-12-31'),
        features: ['HR Management', 'Attendance Tracking', 'Biometric Integration', 'Reports'],
        tier: 'Enterprise Plus',
        maxWebLogins: 3
      },
      'D3F5-H6J8-K1L4-P7R9': {
        isValid: true,
        licensedTo: 'Ministry of Finance Sri Lanka',
        expiryDate: new Date('2025-12-31'),
        features: ['HR Management', 'Attendance Tracking', 'Basic Reports'],
        tier: 'Enterprise Basic',
        maxWebLogins: 1
      },
      'Q2W4-E5R7-T8Y1-U3I6': {
        isValid: true,
        licensedTo: 'Ministry of Finance Sri Lanka',
        expiryDate: new Date('2025-12-31'),
        features: ['HR Management', 'Attendance Tracking', 'Biometric Integration', 'Reports', 'Multi-User Access'],
        tier: 'Enterprise Max',
        maxWebLogins: 5
      },
      'A9S2-D5F7-G3H6-J8K1': {
        isValid: true,
        licensedTo: 'Ministry of Finance Sri Lanka - Demo',
        expiryDate: new Date('2025-12-31'),
        features: ['HR Management', 'Attendance Tracking', 'Demo Features'],
        tier: 'Enterprise Demo',
        maxWebLogins: 999
      }
    };

    const config = licenseConfigs[key];
    const isValid = !!config;
    
    const newLicense: LicenseState = {
      licenseKey: key,
      currentLogins: 0,
      ...config,
      isValid,
      licensedTo: config?.licensedTo || '',
      expiryDate: config?.expiryDate || null,
      features: config?.features || [],
      tier: config?.tier || '',
      maxWebLogins: config?.maxWebLogins || 0
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