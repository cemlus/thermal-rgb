import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Navbar } from "@/components/Navbar";
import { Thermometer, Check } from "lucide-react";

const Signup = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const benefits = [
    "Unlimited image conversions",
    "High-quality PNG outputs",
    "Fast AI processing",
    "Secure & private",
  ];

  return (
    <div className="min-h-screen gradient-surface">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
              <Thermometer className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">
              Start converting thermal and RGB images today
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg animate-slide-up">
            <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-primary mb-3">What you'll get:</p>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <AuthForm mode="signup" />
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
