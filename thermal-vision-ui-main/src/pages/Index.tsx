import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Thermometer, 
  Palette, 
  ArrowRight, 
  Shield, 
  Zap, 
  Image as ImageIcon,
  ArrowRightLeft
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen gradient-surface">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Image Conversion
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Transform Your Images
              <br />
              <span className="gradient-hero bg-clip-text text-transparent">
                Thermal ↔ RGB
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Convert between thermal and RGB imagery with state-of-the-art AI. 
              Perfect for research, security, and industrial applications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Two Powerful Conversion Modes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you need to visualize thermal data or extract thermal signatures, 
              we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Thermal to RGB Card */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 card-hover overflow-hidden">
              <div className="absolute inset-0 gradient-thermal opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl gradient-thermal flex items-center justify-center mb-6 shadow-glow-thermal">
                  <Thermometer className="w-7 h-7 text-thermal-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Thermal → RGB</h3>
                <p className="text-muted-foreground mb-6">
                  Convert thermal imagery into full-color RGB representations. 
                  Reveal details and patterns invisible in raw thermal data.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-thermal">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* RGB to Thermal Card */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 card-hover overflow-hidden">
              <div className="absolute inset-0 gradient-rgb opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl gradient-rgb flex items-center justify-center mb-6 shadow-glow-rgb">
                  <Palette className="w-7 h-7 text-rgb-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">RGB → Thermal</h3>
                <p className="text-muted-foreground mb-6">
                  Generate synthetic thermal representations from standard photos. 
                  Useful for simulation and training scenarios.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-rgb">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Get results in seconds with our optimized AI pipeline
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your images are processed securely and never stored
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">High Quality</h3>
              <p className="text-sm text-muted-foreground">
                State-of-the-art models for professional-grade results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center rounded-3xl gradient-hero p-12 md:p-16 shadow-glow-primary">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6">
              <ArrowRightLeft className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Images?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Join thousands of researchers and professionals using ThermalRGB 
              for their image conversion needs.
            </p>
            <Button
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/signup">
                Start Converting Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-display font-bold">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>ThermalRGB</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ThermalRGB. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
