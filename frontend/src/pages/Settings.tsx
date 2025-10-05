import { useState } from 'react';
import { InventoryLayout } from '@/layouts';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// If your Tabs components are located elsewhere, update the import path accordingly.
// For example, if they are in src/components/Tabs.tsx, use:
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Or, if the file does not exist, create src/components/ui/tabs.tsx and export the components.
import {
  Settings as SettingsIcon,
  User,
  Store,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Printer,
  Barcode,
  Package,
  Users,
  TrendingUp,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertTriangle,
  Info,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';

export default function Settings() {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Stockify Store',
    businessType: 'Retail',
    currency: 'USD',
    timezone: 'UTC+0',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,234.56'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    salesNotifications: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    allowMultipleSessions: true,
    ipRestriction: false
  });

  const [displaySettings, setDisplaySettings] = useState({
    theme: theme,
    compactMode: false,
    showAnimations: true,
    highContrast: false,
    fontSize: 'medium'
  });

  const handleGeneralChange = (key: string, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDisplayChange = (key: string, value: any) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const saveSettings = () => {
    // Implement save functionality
    console.log('Settings saved');
  };

  return (
    <InventoryLayout activeSection="Settings">
      <div className="p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-border p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Settings & Preferences
                  </h1>
                  <p className="text-muted-foreground text-lg mt-2">
                    Customize your Stockify experience and manage your account
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      System Healthy
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Auto-save Enabled
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Cloud Synced
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="bg-card hover:bg-accent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
                <Button onClick={saveSettings} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/50">
              <TabsTrigger value="general" className="flex items-center gap-2 py-3">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 py-3">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center gap-2 py-3">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Display</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2 py-3">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Company Information */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Store className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Company Information</CardTitle>
                        <CardDescription>Basic details about your business</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={generalSettings.companyName}
                        onChange={(e) => handleGeneralChange('companyName', e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <select
                        id="businessType"
                        value={generalSettings.businessType}
                        onChange={(e) => handleGeneralChange('businessType', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Retail">Retail</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          value={generalSettings.currency}
                          onChange={(e) => handleGeneralChange('currency', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          value={generalSettings.timezone}
                          onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="UTC+0">UTC+0 (GMT)</option>
                          <option value="UTC-5">UTC-5 (EST)</option>
                          <option value="UTC-8">UTC-8 (PST)</option>
                          <option value="UTC+5:30">UTC+5:30 (IST)</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Regional Settings</CardTitle>
                        <CardDescription>Localization and format preferences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        value={generalSettings.language}
                        onChange={(e) => handleGeneralChange('language', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <select
                        id="dateFormat"
                        value={generalSettings.dateFormat}
                        onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberFormat">Number Format</Label>
                      <select
                        id="numberFormat"
                        value={generalSettings.numberFormat}
                        onChange={(e) => handleGeneralChange('numberFormat', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="1,234.56">1,234.56</option>
                        <option value="1.234,56">1.234,56</option>
                        <option value="1 234.56">1 234.56</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-card border-border lg:col-span-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Quick Actions</CardTitle>
                        <CardDescription>Common settings and tools</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-card hover:bg-accent">
                        <Package className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">Inventory Settings</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-card hover:bg-accent">
                        <Printer className="h-6 w-6 text-green-500" />
                        <span className="text-sm">Print Setup</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-card hover:bg-accent">
                        <Barcode className="h-6 w-6 text-orange-500" />
                        <span className="text-sm">Barcode Config</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-card hover:bg-accent">
                        <TrendingUp className="h-6 w-6 text-purple-500" />
                        <span className="text-sm">Reports Setup</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Communication Preferences */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Communication</CardTitle>
                        <CardDescription>How you want to receive notifications</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">Email Notifications</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">Push Notifications</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">SMS Notifications</span>
                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Text message alerts</p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Alert Types */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Bell className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Alert Types</CardTitle>
                        <CardDescription>Choose what alerts you want to receive</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-foreground">Low Stock Alerts</span>
                        </div>
                        <p className="text-sm text-muted-foreground">When products are running low</p>
                      </div>
                      <Switch
                        checked={notificationSettings.lowStockAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('lowStockAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-foreground">Sales Notifications</span>
                        </div>
                        <p className="text-sm text-muted-foreground">New sales and orders</p>
                      </div>
                      <Switch
                        checked={notificationSettings.salesNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('salesNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-foreground">System Updates</span>
                        </div>
                        <p className="text-sm text-muted-foreground">App updates and maintenance</p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Authentication */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Authentication</CardTitle>
                        <CardDescription>Secure your account access</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Two-Factor Authentication</span>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                        className="bg-background"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Session Management */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Lock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Session Management</CardTitle>
                        <CardDescription>Control how sessions work</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Multiple Sessions</span>
                        <p className="text-sm text-muted-foreground">Allow login from multiple devices</p>
                      </div>
                      <Switch
                        checked={securitySettings.allowMultipleSessions}
                        onCheckedChange={(checked) => handleSecurityChange('allowMultipleSessions', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">IP Restriction</span>
                        <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                      </div>
                      <Switch
                        checked={securitySettings.ipRestriction}
                        onCheckedChange={(checked) => handleSecurityChange('ipRestriction', checked)}
                      />
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="font-medium text-foreground">Active Sessions</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Laptop className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">Current Session</p>
                              <p className="text-sm text-muted-foreground">Windows • Chrome • 192.168.1.1</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">Mobile App</p>
                              <p className="text-sm text-muted-foreground">iOS • Safari • 2 hours ago</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Revoke</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Theme Settings */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <Palette className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Theme & Appearance</CardTitle>
                        <CardDescription>Customize how Stockify looks</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium mb-4 block">Theme Preference</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'light', label: 'Light', icon: Sun },
                          { key: 'dark', label: 'Dark', icon: Moon },
                          { key: 'system', label: 'System', icon: Monitor }
                        ].map(({ key, label, icon: Icon }) => (
                          <button
                            key={key}
                            onClick={() => handleDisplayChange('theme', key)}
                            className={`p-4 rounded-xl border-2 transition-all hover:border-primary/50 ${
                              theme === key
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <Icon className={`h-6 w-6 mx-auto mb-2 ${
                              theme === key ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <div className="text-sm font-medium">{label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Compact Mode</span>
                        <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
                      </div>
                      <Switch
                        checked={displaySettings.compactMode}
                        onCheckedChange={(checked) => handleDisplayChange('compactMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Animations</span>
                        <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
                      </div>
                      <Switch
                        checked={displaySettings.showAnimations}
                        onCheckedChange={(checked) => handleDisplayChange('showAnimations', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Accessibility */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Accessibility</CardTitle>
                        <CardDescription>Make Stockify easier to use</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <select
                        id="fontSize"
                        value={displaySettings.fontSize}
                        onChange={(e) => handleDisplayChange('fontSize', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">High Contrast</span>
                        <p className="text-sm text-muted-foreground">Increase color contrast</p>
                      </div>
                      <Switch
                        checked={displaySettings.highContrast}
                        onCheckedChange={(checked) => handleDisplayChange('highContrast', checked)}
                      />
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="font-medium text-foreground">Preview</h4>
                      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-foreground">Sample Text</h5>
                        <p className="text-muted-foreground">This is how text will appear with your current settings.</p>
                        <div className="flex gap-2">
                          <Badge>Primary</Badge>
                          <Badge variant="secondary">Secondary</Badge>
                          <Badge variant="outline">Outline</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Data Management */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Data Management</CardTitle>
                        <CardDescription>Import, export, and manage your data</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start bg-card hover:bg-accent">
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-card hover:bg-accent">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-card hover:bg-accent">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Backup Database
                    </Button>
                    <Separator />
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                        <Info className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">System Information</CardTitle>
                        <CardDescription>Application and system details</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Version</p>
                        <p className="font-medium text-foreground">v2.1.0</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Build</p>
                        <p className="font-medium text-foreground">20241005</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Environment</p>
                        <p className="font-medium text-foreground">Production</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Server</p>
                        <p className="font-medium text-foreground">Healthy</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Storage Usage</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Used</span>
                          <span className="text-foreground">2.3 GB of 10 GB</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </InventoryLayout>
  );
}
