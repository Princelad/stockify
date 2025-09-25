import { LoginForm } from "@/components/auth";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Login() {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
    
    if (location.state?.error) {
      setErrorMessage(location.state.error);
      // Clear the error after 5 seconds
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {successMessage && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {errorMessage}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
