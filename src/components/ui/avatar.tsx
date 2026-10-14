import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away' | null;
  shape?: 'circle' | 'square' | 'rounded';
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = 'User',
      name,
      size = 'md',
      status = null,
      shape = 'circle',
      fallback,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    };

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-secondary-400',
      busy: 'bg-red-500',
      away: 'bg-yellow-500',
    };

    const statusPositions = {
      xs: '-bottom-0.5 -right-0.5',
      sm: '-bottom-1 -right-1',
      md: '-bottom-1.5 -right-1.5',
      lg: '-bottom-2 -right-2',
      xl: '-bottom-2.5 -right-2.5',
    };

    // Generate initials from name
    const getInitials = (name: string | undefined): string => {
      if (!name) return 'U';
      const parts = name.split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    };

    // Generate fallback color based on name
    const getFallbackColor = (name: string | undefined): string => {
      if (!name) return 'bg-primary-500';
      const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <div className="relative inline-block" ref={ref} {...props}>
        <div
          className={cn(
            'overflow-hidden flex items-center justify-center',
            shapes[shape],
            sizes[size],
            className
          )}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center',
                getFallbackColor(name)
              )}
            >
              {fallback || (
                <span className="text-white font-medium">
                  {getInitials(name)}
                </span>
              )}
            </div>
          )}
        </div>
        {status && (
          <span
            className={cn(
              'absolute block h-2 w-2 rounded-full border-2 border-white',
              statusColors[status],
              statusPositions[size]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 3, size = 'md', children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const extraCount = childrenArray.length - max;

    const sizes = {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center -space-x-2', className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className={cn(
              'border-2 border-white',
              sizes[size],
              index === 0 && '-ml-0'
            )}
            style={{ zIndex: childrenArray.length - index }}
          >
            {child}
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-secondary-600 text-sm font-medium border-2 border-white',
              sizes[size]
            )}
            style={{ zIndex: 0 }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
