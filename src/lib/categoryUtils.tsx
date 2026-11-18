import React from "react";
import {
  Brush,
  Wrench,
  Zap,
  Thermometer,
  Home,
  Hammer,
  Cpu,
  Paintbrush,
  Scissors,
  Layers,
} from "lucide-react";

/**
 * Shared Category Icon renderer for list and detail views.
 */
export const getCategoryIcon = (iconName: string, className = "h-5 w-5") => {
  if (
    iconName &&
    (iconName.startsWith("data:") ||
      iconName.startsWith("http") ||
      iconName.startsWith("/"))
  ) {
    return (
      <img
        src={iconName}
        alt="Category Icon"
        className={`${className} object-contain`}
      />
    );
  }

  switch (iconName?.toLowerCase()) {
    case "brush":
    case "sparkles":
      return <Brush className={className} />;
    case "wrench":
      return <Wrench className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "thermometer":
      return <Thermometer className={className} />;
    case "home":
      return <Home className={className} />;
    case "hammer":
      return <Hammer className={className} />;
    case "cpu":
      return <Cpu className={className} />;
    case "paintbrush":
      return <Paintbrush className={className} />;
    case "scissors":
      return <Scissors className={className} />;
    default:
      return <Layers className={className} />;
  }
};

