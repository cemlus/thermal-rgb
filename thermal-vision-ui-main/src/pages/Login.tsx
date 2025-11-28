import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Navbar } from "@/components/Navbar";
import { Thermometer } from "lucide-react";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen gradient-surface">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
              <Thermometer className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue converting images
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg animate-slide-up">
            <AuthForm mode="login" />
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            🔒 Your credentials are securely transmitted over HTTPS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
