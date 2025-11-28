import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageResultCardProps {
  imageUrl: string;
  mode: "thermal-to-rgb" | "rgb-to-thermal";
  timestamp: Date;
  className?: string;
}

export const ImageResultCard = ({
  imageUrl,
  mode,
  timestamp,
  className,
}: ImageResultCardProps) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `converted-${mode}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open(imageUrl, "_blank");
  };

  const gradientClass = mode === "thermal-to-rgb" ? "gradient-rgb" : "gradient-thermal";
  const labelText = mode === "thermal-to-rgb" ? "RGB Output" : "Thermal Output";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden animate-scale-in",
        className
      )}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt="Converted result"
          className="w-full h-auto max-h-[400px] object-contain bg-muted/30"
        />
        <div
          className={cn(
            "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground",
            gradientClass
          )}
        >
          {labelText}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {timestamp.toLocaleDateString()} at{" "}
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant={mode === "thermal-to-rgb" ? "rgb" : "thermal"}
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleOpenNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
