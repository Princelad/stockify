import { SignupForm } from "@/components/auth";

function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <SignupForm />
      </div>
    </div>
  );
}

export default Signup;
