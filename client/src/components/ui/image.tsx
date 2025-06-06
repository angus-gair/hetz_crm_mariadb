import React from "react";
import { cn } from "@/lib/utils";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, alt, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn("object-cover w-full h-full", className)}
        alt={alt}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export default Image;
