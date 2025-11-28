import { useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { FileUploader } from "@/components/FileUploader";
import { ImageResultCard } from "@/components/ImageResultCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { conversionApi } from "@/api/axios";
import { toast } from "sonner";
import { Thermometer, Palette, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversionResult {
  id: string;
  imageUrl: string;
  mode: "thermal-to-rgb" | "rgb-to-thermal";
  timestamp: Date;
}

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"thermal-to-rgb" | "rgb-to-thermal">("thermal-to-rgb");
  const [history, setHistory] = useState<ConversionResult[]>(() => {
    const saved = localStorage.getItem("conversion_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setCurrentResult(null);
  }, []);

  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsConverting(true);
    try {
      const blob = activeTab === "thermal-to-rgb"
        ? await conversionApi.thermalToRgb(selectedFile)
        : await conversionApi.rgbToThermal(selectedFile);

      const imageUrl = URL.createObjectURL(blob);
      setCurrentResult(imageUrl);

      // Add to history
      const newResult: ConversionResult = {
        id: Date.now().toString(),
        imageUrl,
        mode: activeTab,
        timestamp: new Date(),
      };

      const updatedHistory = [newResult, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("conversion_history", JSON.stringify(updatedHistory));

      toast.success("Image converted successfully!");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Conversion failed";
      toast.error(message);
    } finally {
      setIsConverting(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen gradient-surface">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Convert your images between thermal and RGB formats
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Conversion Area */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => {
                setActiveTab(v as typeof activeTab);
                resetUpload();
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-14">
                <TabsTrigger 
                  value="thermal-to-rgb" 
                  className="data-[state=active]:gradient-thermal data-[state=active]:text-thermal-foreground h-12"
                >
                  <Thermometer className="w-4 h-4 mr-2" />
                  Thermal → RGB
                </TabsTrigger>
                <TabsTrigger 
                  value="rgb-to-thermal"
                  className="data-[state=active]:gradient-rgb data-[state=active]:text-rgb-foreground h-12"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  RGB → Thermal
                </TabsTrigger>
              </TabsList>

              <TabsContent value="thermal-to-rgb" className="mt-6 animate-fade-in">
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Upload Thermal Image</h2>
                    <p className="text-sm text-muted-foreground">
                      Upload a thermal image to convert it to RGB representation
                    </p>
                  </div>
                  
                  <FileUploader
                    onFileSelect={handleFileSelect}
                    variant="thermal"
                  />

                  <Button
                    variant="thermal"
                    size="lg"
                    className="w-full"
                    onClick={handleConvert}
                    disabled={!selectedFile || isConverting}
                  >
                    {isConverting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2 border-thermal-foreground/30 border-t-thermal-foreground" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Convert to RGB
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="rgb-to-thermal" className="mt-6 animate-fade-in">
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Upload RGB Image</h2>
                    <p className="text-sm text-muted-foreground">
                      Upload an RGB image to generate a thermal representation
                    </p>
                  </div>
                  
                  <FileUploader
                    onFileSelect={handleFileSelect}
                    variant="rgb"
                  />

                  <Button
                    variant="rgb"
                    size="lg"
                    className="w-full"
                    onClick={handleConvert}
                    disabled={!selectedFile || isConverting}
                  >
                    {isConverting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2 border-rgb-foreground/30 border-t-rgb-foreground" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Convert to Thermal
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Result Display */}
            {currentResult && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conversion Result</h3>
                <ImageResultCard
                  imageUrl={currentResult}
                  mode={activeTab}
                  timestamp={new Date()}
                />
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Recent Conversions</h3>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-4">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <History className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No conversions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your recent conversions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-lg border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors",
                        item.mode === "thermal-to-rgb" ? "border-thermal/30" : "border-rgb/30"
                      )}
                      onClick={() => setCurrentResult(item.imageUrl)}
                    >
                      <img
                        src={item.imageUrl}
                        alt="Conversion result"
                        className="w-full h-24 object-cover"
                      />
                      <div className="p-2">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                            item.mode === "thermal-to-rgb"
                              ? "bg-thermal/10 text-thermal"
                              : "bg-rgb/10 text-rgb"
                          )}
                        >
                          {item.mode === "thermal-to-rgb" ? (
                            <>
                              <Thermometer className="w-3 h-3" />
                              RGB
                            </>
                          ) : (
                            <>
                              <Palette className="w-3 h-3" />
                              Thermal
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
