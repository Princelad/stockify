import { useState, useEffect } from 'react';
import { InventoryLayout } from '@/layouts';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/lib/api';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Camera,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  Bell,
  Download,
  RefreshCw,
  Plus,
  BarChart3,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

interface UserStats {
  productsAdded: number;
  totalSales: number;
  salesThisMonth: number;
  productsViewed: number;
  lastActivity: string;
  joinDate: string;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'product_added' | 'sale_completed' | 'profile_updated' | 'login';
  description: string;
  timestamp: string;
  metadata?: any;
}

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  darkMode: boolean;
  language: string;
  currency: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { setTheme, theme, actualTheme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'preferences'>('overview');
  
  const [userStats, setUserStats] = useState<UserStats>({
    productsAdded: 0,
    totalSales: 0,
    salesThisMonth: 0,
    productsViewed: 0,
    lastActivity: 'Never',
    joinDate: 'Unknown',
    completionRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'English',
    currency: 'USD'
  });

  // Form data - initialize with proper fallbacks
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Load fresh user data on component mount
  useEffect(() => {
    const loadFreshData = async () => {
      try {
        // Always refresh user data when profile page loads
        await refreshUser();
      } catch (error) {
        console.error('Failed to load fresh user data:', error);
      }
    };
    
    loadFreshData();
  }, []); // Run once on mount

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Initialize form data with user data
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
      });

      // Load all data in parallel with error handling
      const promises = [
        loadUserStats().catch(err => console.error('Stats error:', err)),
        loadRecentActivity().catch(err => console.error('Activity error:', err)),
        loadUserPreferences().catch(err => console.error('Preferences error:', err))
      ];
      
      await Promise.allSettled(promises);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: 'Some data failed to load, but you can still use the profile page' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    setStatsLoading(true);
    try {
      // Check cache first (cache for 5 minutes)
      const cacheKey = `userStats_${user?.id}`;
      const cachedStats = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (cachedStats && cacheTime && (now - parseInt(cacheTime) < fiveMinutes)) {
        // Use cached data
        const stats = JSON.parse(cachedStats);
        setUserStats({
          ...stats,
          lastActivity: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
          joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
          completionRate: calculateProfileCompletion()
        });
        setStatsLoading(false);
        return;
      }

      // Fetch fresh data from API
      const response = await apiService.getUserStats();
      if (response.success && response.data) {
        const stats = response.data;
        const newStats = {
          productsAdded: stats.productsAdded || 0,
          totalSales: stats.totalSales || 0,
          salesThisMonth: stats.salesThisMonth || 0,
          productsViewed: stats.productsViewed || 0,
          totalTransactions: stats.totalTransactions || 0,
          transactionsThisMonth: stats.transactionsThisMonth || 0
        };
        
        // Cache the stats
        localStorage.setItem(cacheKey, JSON.stringify(newStats));
        localStorage.setItem(`${cacheKey}_time`, now.toString());
        
        setUserStats({
          ...newStats,
          lastActivity: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
          joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
          completionRate: calculateProfileCompletion()
        });
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // Set default stats on error
      setUserStats(prev => ({
        ...prev,
        lastActivity: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
        completionRate: calculateProfileCompletion()
      }));
    } finally {
      setStatsLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await apiService.getUserActivity();
      if (response.success && response.data && response.data.activities) {
        setRecentActivity(response.data.activities);
      }
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      // Set empty activity on error
      setRecentActivity([]);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await apiService.getUserPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      // Keep default preferences on error
    }
  };

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    const fields = [
      user.name,
      user.email,
      formData.phone || user.phone,
      formData.bio || user.bio,
      user.avatar
    ];
    const completed = fields.filter(field => field && String(field).trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = async (key: keyof UserPreferences, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Handle dark mode preference change with ThemeContext integration
    if (key === 'darkMode') {
      const newTheme = value ? 'dark' : 'light';
      setTheme(newTheme);
    }
    
    try {
      const response = await apiService.updateUserPreferences(newPreferences);
      if (response.success) {
        setMessage({ type: 'success', text: 'Preferences updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to update preferences');
      }
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update preferences' });
      // Revert preferences on error
      setPreferences(prev => ({ ...prev, [key]: prev[key] }));
      // Revert theme change on error
      if (key === 'darkMode') {
        const revertTheme = preferences.darkMode ? 'dark' : 'light';
        setTheme(revertTheme);
      }
    }
  };

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-upload avatar immediately
      try {
        setSaveLoading(true);
        setMessage({ type: 'success', text: 'Uploading avatar...' });
        
        const avatarResponse = await apiService.uploadAvatar(file);
        if (avatarResponse.success) {
          setMessage({ type: 'success', text: 'Avatar updated successfully!' });
          setAvatarFile(null);
          setAvatarPreview(null);
          
          // Refresh user data to get new avatar
          await refreshUser();
        } else {
          throw new Error(avatarResponse.message || 'Failed to upload avatar');
        }
      } catch (error: any) {
        console.error('Avatar upload error:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to upload avatar' });
        setAvatarFile(null);
        setAvatarPreview(null);
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }

    setSaveLoading(true);
    setMessage(null);

    try {
      // Update profile (avatar is handled separately)
      const response = await apiService.updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        
        // Refresh user data
        await refreshUser();
        
        // Recalculate completion rate
        setUserStats(prev => ({
          ...prev,
          completionRate: calculateProfileCompletion()
        }));
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
    setMessage(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const refreshStats = async () => {
    // Clear cache to force fresh data
    const cacheKey = `userStats_${user?.id}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`${cacheKey}_time`);
    
    await loadUserStats();
    setMessage({ type: 'success', text: 'Stats refreshed successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const exportData = async () => {
    try {
      const response = await apiService.exportUserData();
      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setMessage({ type: 'success', text: 'Data exported successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to export data');
      }
    } catch (error: any) {
      console.error('Failed to export data:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to export data' });
    }
  };

  // Show loading skeleton while loading
  if (loading) {
    return (
      <InventoryLayout activeSection="Profile">
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Skeleton className="h-80 w-full" />
              </div>
              <div className="lg:col-span-3">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout activeSection="Profile">
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your account, view activity, and customize preferences</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={refreshStats}
                variant="outline"
                size="sm"
                disabled={statsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                onClick={() => editing ? handleCancelEdit() : setEditing(true)}
                variant={editing ? "outline" : "default"}
                className={editing ? "" : "bg-blue-600 hover:bg-blue-700"}
                disabled={saveLoading}
              >
                {editing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alert Messages */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Products Added</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <Skeleton className="h-6 w-12" /> : userStats.productsAdded.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <Skeleton className="h-6 w-16" /> : `$${userStats.totalSales.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <Skeleton className="h-6 w-16" /> : `$${userStats.salesThisMonth.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Profile Complete</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.completionRate}%</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <Progress value={userStats.completionRate} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content with Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Enhanced Profile Card */}
            <div className="lg:col-span-1">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={avatarPreview || (user?.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}` : '')} 
                        alt={user?.name} 
                      />
                      <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {editing && (
                      <label className={`absolute -bottom-2 -right-2 p-2 rounded-full cursor-pointer transition-colors ${
                        saveLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}>
                        {saveLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarSelect}
                          className="hidden"
                          disabled={saveLoading}
                        />
                      </label>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {user?.name}
                  </h2>
                  
                  <Badge className={`mb-4 ${getRoleColor(user?.role || 'staff')}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role?.charAt(0).toUpperCase() + (user?.role?.slice(1) || '')}
                  </Badge>

                  <div className="space-y-3 text-sm text-gray-600 mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {userStats.joinDate}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Last active {userStats.lastActivity}</span>
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Profile Completion</span>
                      <span className="text-sm text-gray-600">{userStats.completionRate}%</span>
                    </div>
                    <Progress value={userStats.completionRate} className="h-2" />
                    {userStats.completionRate < 100 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Complete your profile to unlock all features
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Main Content */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg">
                {[
                  {
                    key: 'overview',
                    label: 'Overview',
                    icon: User
                  },
                  {
                    key: 'activity',
                    label: 'Activity',
                    icon: Activity
                  },
                  {
                    key: 'preferences',
                    label: 'Preferences',
                    icon: Settings
                  }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                      activeTab === key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your account details and personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Enhanced form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {editing ? (
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                            {formData.name || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        {editing ? (
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                            {formData.email}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {editing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                            {formData.phone || 'Not provided'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Role</Label>
                        <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 capitalize">
                          {user?.role}
                        </div>
                      </div>
                    </div>

                    {editing && (
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell us a bit about yourself..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {editing && (
                      <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={saveLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saveLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saveLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'activity' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Track your recent actions and system interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                            <div className="flex-shrink-0">
                              {activity.type === 'product_added' && <Plus className="h-5 w-5 text-green-600" />}
                              {activity.type === 'sale_completed' && <DollarSign className="h-5 w-5 text-blue-600" />}
                              {activity.type === 'profile_updated' && <Edit className="h-5 w-5 text-orange-600" />}
                              {activity.type === 'login' && <Eye className="h-5 w-5 text-gray-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No recent activity found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'preferences' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-blue-600" />
                      Account Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your account settings and notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Notifications */}
                    <div>
                      <h4 className="font-medium mb-4">Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Bell className="h-4 w-4 text-gray-600" />
                              <span className="font-medium">Email Notifications</span>
                            </div>
                            <p className="text-sm text-gray-600">Receive updates via email</p>
                          </div>
                          <Switch
                            checked={preferences.emailNotifications}
                            onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Bell className="h-4 w-4 text-gray-600" />
                              <span className="font-medium">SMS Notifications</span>
                            </div>
                            <p className="text-sm text-gray-600">Receive updates via SMS</p>
                          </div>
                          <Switch
                            checked={preferences.smsNotifications}
                            onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Display Preferences */}
                    <div>
                      <h4 className="font-medium mb-4">Display Settings</h4>
                      <div className="space-y-6">
                        {/* Theme Selection */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            {actualTheme === 'dark' ? (
                              <Moon className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Sun className="h-5 w-5 text-yellow-500" />
                            )}
                            <span className="font-medium">Theme Preference</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Choose your preferred theme or follow system settings
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { key: 'light', label: 'Light', icon: Sun, description: 'Light theme' },
                              { key: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme' },
                              { key: 'system', label: 'System', icon: Monitor, description: 'Follow system' }
                            ].map(({ key, label, icon: Icon, description }) => (
                              <button
                                key={key}
                                onClick={() => {
                                  setTheme(key as any);
                                  // Update preferences to sync with backend
                                  if (key !== 'system') {
                                    handlePreferenceChange('darkMode', key === 'dark');
                                  }
                                }}
                                className={`p-4 rounded-lg border-2 transition-all hover:border-blue-300 ${
                                  theme === key
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                    : 'border-border hover:bg-accent'
                                }`}
                              >
                                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                                  theme === key ? 'text-blue-500' : 'text-muted-foreground'
                                }`} />
                                <div className="text-sm font-medium">{label}</div>
                                <div className="text-xs text-muted-foreground mt-1">{description}</div>
                              </button>
                            ))}
                          </div>
                          
                          {theme === 'system' && (
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Monitor className="h-4 w-4" />
                                <span>
                                  Currently using <strong>{actualTheme}</strong> theme based on your system settings
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Regional Settings */}
                    <div>
                      <h4 className="font-medium mb-4">Regional Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <select
                            value={preferences.language}
                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <select
                            value={preferences.currency}
                            onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account Security - Always visible */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-600">Keep your account secure</p>
                    </div>
                    <ChangePasswordDialog />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Login Sessions</h4>
                      <p className="text-sm text-gray-600">Manage your active sessions</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Settings className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}

// Change Password Dialog Component
function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
