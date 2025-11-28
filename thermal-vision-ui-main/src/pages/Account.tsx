import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  AlertTriangle,
  Info
} from "lucide-react";

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out");
    navigate("/");
  };

  return (
    <div className="min-h-screen gradient-surface">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Account</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Your account information
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm">{user?.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex gap-4">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">Security Note</h3>
                  <p className="text-sm text-muted-foreground">
                    Your authentication token is stored in local storage for this MVP. 
                    For enhanced security in production, we recommend migrating to 
                    HttpOnly cookies with refresh token rotation. This prevents XSS 
                    attacks from accessing your credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-destructive/20 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your current session
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
