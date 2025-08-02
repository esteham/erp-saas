import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaUser, 
  FaBell, 
  FaShieldAlt,
  FaDatabase,
  FaEnvelope,
  FaPalette,
  FaGlobe,
  FaSave,
  FaUndo,
  FaToggleOn,
  FaToggleOff,
  FaKey
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const SettingsContent = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}backend/api/admin/settings.php`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSettings(response.data.data || {});
      } else {
        // Fallback settings for demo
        setSettings({
          general: {
            siteName: 'Local Service Provider',
            siteDescription: 'Professional home services platform',
            timezone: 'America/New_York',
            language: 'en',
            maintenanceMode: false
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            adminAlerts: true,
            workerUpdates: true,
            customerConfirmations: true
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
            loginAttempts: 5,
            ipWhitelist: '',
            sslRequired: true
          },
          email: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            fromEmail: 'noreply@localservice.com',
            fromName: 'Local Service Provider'
          },
          appearance: {
            theme: 'light',
            primaryColor: '#dc2626',
            secondaryColor: '#6b7280',
            logoUrl: '',
            faviconUrl: ''
          },
          system: {
            backupFrequency: 'daily',
            logLevel: 'info',
            cacheEnabled: true,
            debugMode: false,
            apiRateLimit: 1000
          }
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await axios.post(`${BASE_URL}backend/api/admin/settings.php`, {
        settings
      }, { withCredentials: true });
      
      if (response.data.success) {
        toast.success('Settings saved successfully');
        setHasChanges(false);
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      loadSettings();
      setHasChanges(false);
      toast.info('Settings reset to default values');
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const settingSections = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'email', label: 'Email', icon: FaEnvelope },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'system', label: 'System', icon: FaDatabase }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3><FaCog /> General Settings</h3>
      
      <div className="setting-group">
        <label>Site Name</label>
        <input
          type="text"
          value={settings.general?.siteName || ''}
          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
          className="form-control"
        />
      </div>

      <div className="setting-group">
        <label>Site Description</label>
        <textarea
          value={settings.general?.siteDescription || ''}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          className="form-control"
          rows="3"
        />
      </div>

      <div className="setting-row">
        <div className="setting-group">
          <label>Timezone</label>
          <select
            value={settings.general?.timezone || ''}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="form-control"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Language</label>
          <select
            value={settings.general?.language || ''}
            onChange={(e) => updateSetting('general', 'language', e.target.value)}
            className="form-control"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      <div className="setting-group">
        <label className="toggle-label">
          <span>Maintenance Mode</span>
          <button
            className={`toggle-btn ${settings.general?.maintenanceMode ? 'active' : ''}`}
            onClick={() => updateSetting('general', 'maintenanceMode', !settings.general?.maintenanceMode)}
          >
            {settings.general?.maintenanceMode ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </label>
        <small>Enable maintenance mode to temporarily disable the site</small>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3><FaBell /> Notification Settings</h3>
      
      {Object.entries(settings.notifications || {}).map(([key, value]) => (
        <div key={key} className="setting-group">
          <label className="toggle-label">
            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
            <button
              className={`toggle-btn ${value ? 'active' : ''}`}
              onClick={() => updateSetting('notifications', key, !value)}
            >
              {value ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </label>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3><FaShieldAlt /> Security Settings</h3>
      
      <div className="setting-group">
        <label className="toggle-label">
          <span>Two-Factor Authentication</span>
          <button
            className={`toggle-btn ${settings.security?.twoFactorAuth ? 'active' : ''}`}
            onClick={() => updateSetting('security', 'twoFactorAuth', !settings.security?.twoFactorAuth)}
          >
            {settings.security?.twoFactorAuth ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </label>
      </div>

      <div className="setting-row">
        <div className="setting-group">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security?.sessionTimeout || ''}
            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className="form-control"
            min="5"
            max="1440"
          />
        </div>

        <div className="setting-group">
          <label>Password Expiry (days)</label>
          <input
            type="number"
            value={settings.security?.passwordExpiry || ''}
            onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
            className="form-control"
            min="30"
            max="365"
          />
        </div>
      </div>

      <div className="setting-group">
        <label>Max Login Attempts</label>
        <input
          type="number"
          value={settings.security?.loginAttempts || ''}
          onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
          className="form-control"
          min="3"
          max="10"
        />
      </div>

      <div className="setting-group">
        <label>IP Whitelist (comma-separated)</label>
        <textarea
          value={settings.security?.ipWhitelist || ''}
          onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
          className="form-control"
          rows="3"
          placeholder="192.168.1.1, 10.0.0.1"
        />
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="settings-section">
      <h3><FaEnvelope /> Email Settings</h3>
      
      <div className="setting-row">
        <div className="setting-group">
          <label>SMTP Host</label>
          <input
            type="text"
            value={settings.email?.smtpHost || ''}
            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="setting-group">
          <label>SMTP Port</label>
          <input
            type="number"
            value={settings.email?.smtpPort || ''}
            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
            className="form-control"
          />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-group">
          <label>SMTP Username</label>
          <input
            type="text"
            value={settings.email?.smtpUser || ''}
            onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="setting-group">
          <label>SMTP Password</label>
          <input
            type="password"
            value={settings.email?.smtpPassword || ''}
            onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-group">
          <label>From Email</label>
          <input
            type="email"
            value={settings.email?.fromEmail || ''}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="setting-group">
          <label>From Name</label>
          <input
            type="text"
            value={settings.email?.fromName || ''}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className="form-control"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h3><FaPalette /> Appearance Settings</h3>
      
      <div className="setting-group">
        <label>Theme</label>
        <select
          value={settings.appearance?.theme || ''}
          onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
          className="form-control"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="setting-row">
        <div className="setting-group">
          <label>Primary Color</label>
          <input
            type="color"
            value={settings.appearance?.primaryColor || '#dc2626'}
            onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
            className="form-control color-input"
          />
        </div>

        <div className="setting-group">
          <label>Secondary Color</label>
          <input
            type="color"
            value={settings.appearance?.secondaryColor || '#6b7280'}
            onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
            className="form-control color-input"
          />
        </div>
      </div>

      <div className="setting-group">
        <label>Logo URL</label>
        <input
          type="url"
          value={settings.appearance?.logoUrl || ''}
          onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
          className="form-control"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div className="setting-group">
        <label>Favicon URL</label>
        <input
          type="url"
          value={settings.appearance?.faviconUrl || ''}
          onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
          className="form-control"
          placeholder="https://example.com/favicon.ico"
        />
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-section">
      <h3><FaDatabase /> System Settings</h3>
      
      <div className="setting-group">
        <label>Backup Frequency</label>
        <select
          value={settings.system?.backupFrequency || ''}
          onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
          className="form-control"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Log Level</label>
        <select
          value={settings.system?.logLevel || ''}
          onChange={(e) => updateSetting('system', 'logLevel', e.target.value)}
          className="form-control"
        >
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      <div className="setting-group">
        <label>API Rate Limit (requests/hour)</label>
        <input
          type="number"
          value={settings.system?.apiRateLimit || ''}
          onChange={(e) => updateSetting('system', 'apiRateLimit', parseInt(e.target.value))}
          className="form-control"
          min="100"
          max="10000"
        />
      </div>

      <div className="setting-group">
        <label className="toggle-label">
          <span>Cache Enabled</span>
          <button
            className={`toggle-btn ${settings.system?.cacheEnabled ? 'active' : ''}`}
            onClick={() => updateSetting('system', 'cacheEnabled', !settings.system?.cacheEnabled)}
          >
            {settings.system?.cacheEnabled ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </label>
      </div>

      <div className="setting-group">
        <label className="toggle-label">
          <span>Debug Mode</span>
          <button
            className={`toggle-btn ${settings.system?.debugMode ? 'active' : ''}`}
            onClick={() => updateSetting('system', 'debugMode', !settings.system?.debugMode)}
          >
            {settings.system?.debugMode ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </label>
        <small>Enable debug mode for development only</small>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'email': return renderEmailSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'system': return renderSystemSettings();
      default: return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-content">
      <div className="content-header">
        <h2><FaCog /> System Settings</h2>
        <div className="header-actions">
          {hasChanges && (
            <>
              <button 
                className="btn btn-outline"
                onClick={resetSettings}
              >
                <FaUndo /> Reset
              </button>
              <button 
                className="btn btn-primary"
                onClick={saveSettings}
                disabled={saving}
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation */}
        <div className="settings-nav">
          {settingSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <IconComponent />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="settings-main">
          {renderContent()}
        </div>
      </div>

      <style jsx>{`
        .settings-content {
          max-width: 1400px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          gap: 1rem;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .content-header h2 {
          margin: 0;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
          height: calc(100vh - 250px);
        }

        .settings-nav {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 1rem;
          height: fit-content;
        }

        .nav-item {
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          color: #6b7280;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #374151;
        }

        .nav-item.active {
          background: #dc2626;
          color: white;
        }

        .settings-main {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 2rem;
          overflow-y: auto;
        }

        .settings-section h3 {
          margin: 0 0 2rem 0;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
        }

        .setting-group {
          margin-bottom: 1.5rem;
        }

        .setting-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .setting-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
          font-weight: 500;
        }

        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.3s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .color-input {
          height: 50px;
          padding: 0.25rem;
        }

        .toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: #e5e7eb;
          transition: color 0.3s ease;
        }

        .toggle-btn.active {
          color: #dc2626;
        }

        .setting-group small {
          display: block;
          margin-top: 0.25rem;
          color: #6b7280;
          font-size: 0.75rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary { background: #dc2626; color: white; }
        .btn-outline { 
          background: transparent; 
          color: #6b7280; 
          border: 1px solid #e5e7eb; 
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .setting-row {
            grid-template-columns: 1fr;
          }

          .settings-nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5rem;
          }

          .nav-item {
            margin-bottom: 0;
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsContent;
