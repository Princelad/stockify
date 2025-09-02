import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login', { 
            state: { 
              error: 'Authentication failed. Please try again.' 
            } 
          });
          return;
        }

        if (!token) {
          console.error('No token received');
          navigate('/login', { 
            state: { 
              error: 'Authentication failed. No token received.' 
            } 
          });
          return;
        }

        // Save token and verify user
        localStorage.setItem('authToken', token);
        
        // Verify the token and get user info
        const response = await apiService.verifyToken();
        
        if (response.success && response.user) {
          // Save user data
          localStorage.setItem('userData', JSON.stringify(response.user));
          
          // Update auth context
          login(response.user);
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          throw new Error('Failed to verify user token');
        }
        
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
          state: { 
            error: 'Authentication failed. Please try again.' 
          } 
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
