// This file now handles Group Working Hours settings instead of HRSettings
import { GroupWorkingHours } from '../shared/schema';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express, { Router } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SETTINGS_FILE = join(__dirname, 'data', 'group-working-hours.json');

// Ensure data directory exists
const DATA_DIR = dirname(SETTINGS_FILE);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default settings if file doesn't exist
const defaultSettings: GroupWorkingHours = {
  groupA: {
    startTime: '08:30',
    endTime: '16:15',
    durationMinutes: 465,
    lateArrivalPolicy: {
      gracePeriodUntil: '09:00',
      halfDayAfter: '10:00',
      halfDayBefore: '14:45'
    },
    shortLeavePolicy: {
      morningStart: '08:30',
      morningEnd: '10:00',
      eveningStart: '14:45',
      eveningEnd: '16:15',
      maxPerMonth: 2,
      preApprovalRequired: true,
      minimumWorkingHoursRequired: true
    }
  },
  groupB: {
    startTime: '08:00',
    endTime: '16:45',
    durationMinutes: 525,
    lateArrivalPolicy: {
      gracePeriodUntil: '08:15',
      halfDayAfter: '09:30',
      halfDayBefore: '15:15',
      shortLeaveAllowance: true
    },
    shortLeavePolicy: {
      morningStart: '08:00',
      morningEnd: '09:30',
      eveningStart: '15:15',
      eveningEnd: '16:45',
      maxPerMonth: 2,
      preApprovalRequired: true
    }
  }
};

// Load settings from file or create with defaults
function loadSettings(): GroupWorkingHours {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
    // If file doesn't exist, save defaults
    saveSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
}

// Save settings to file
function saveSettings(settings: GroupWorkingHours): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Get current settings
export function getGroupWorkingHours(): GroupWorkingHours {
  return loadSettings();
}

// Update settings
export function updateGroupWorkingHours(newSettings: Partial<GroupWorkingHours>): GroupWorkingHours {
  const currentSettings = loadSettings();
  const updatedSettings = {
    groupA: { ...currentSettings.groupA, ...newSettings.groupA },
    groupB: { ...currentSettings.groupB, ...newSettings.groupB }
  };
  saveSettings(updatedSettings);
  return updatedSettings;
}

const router: Router = express.Router();

// Save HR settings including attendance calculation guidelines
router.post('/api/hr-settings', async (req, res) => {
  try {
    const settings = req.body;
    fs.writeFileSync(join(__dirname, 'data', 'hr-settings.json'), JSON.stringify(settings, null, 2));
    res.json({ message: 'HR settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save HR settings' });
  }
});

export default router;
