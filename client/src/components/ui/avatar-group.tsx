import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    fallback: string;
    alt?: string;
  }>;
  max?: number;
  className?: string;
}

export function AvatarGroup({ avatars, max = 3, className }: AvatarGroupProps) {
  const displayedAvatars = avatars.slice(0, max);
  const extraAvatars = avatars.length - max;
  
  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayedAvatars.map((avatar, i) => (
        <Avatar 
          key={i} 
          className="border-2 border-background h-6 w-6"
        >
          <AvatarImage src={avatar.src} alt={avatar.alt || avatar.fallback} />
          <AvatarFallback className="text-xs">
            {avatar.fallback}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {extraAvatars > 0 && (
        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
          +{extraAvatars}
        </div>
      )}
    </div>
  );
}
