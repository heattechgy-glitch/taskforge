import { cn } from "@/lib/utils";

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className, 
  disabled,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-sky-500 text-white hover:bg-sky-600",
    secondary: "bg-gray-700 text-gray-100 hover:bg-gray-600",
    ghost: "bg-transparent text-gray-300 hover:bg-gray-800"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "success", className }) {
  const variants = {
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20"
  };
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Avatar({ src, alt, initials, size = "md", className }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base"
  };
  
  if (src) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        className={cn("rounded-full object-cover", sizes[size], className)}
      />
    );
  }
  
  return (
    <div className={cn("rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold", sizes[size], className)}>
      {initials || "??"}
    </div>
  );
}

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn("bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function LoadingSpinner({ size = "md", className }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };
  
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-sky-500 border-t-transparent",
        sizes[size],
        className
      )}
    />
  );
}