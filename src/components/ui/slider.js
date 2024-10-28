import React from "react";
import { cn } from "../../lib/utils";

const Slider = React.forwardRef(({ className, value, onValueChange, ...props }, ref) => {
  return (
    <input
      type="range"
      value={value?.[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      className={cn(
        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700",
        "appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500",
        "hover:[&::-webkit-slider-thumb]:bg-blue-600",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Slider.displayName = "Slider";

export { Slider };