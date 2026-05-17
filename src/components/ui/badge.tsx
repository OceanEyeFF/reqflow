import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-900 text-white",
        secondary: "border-transparent bg-gray-100 text-gray-700",
        destructive: "border-transparent bg-red-100 text-red-700",
        outline: "text-gray-700 border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Status-specific styles
const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  waiting_feedback: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-800",
};

const priorityStyles: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

// Role-specific styles
const roleStyles: Record<string, string> = {
  owner: "bg-violet-100 text-violet-800",
  collaborator: "bg-green-100 text-green-800",
  watcher: "bg-gray-100 text-gray-600",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  status?: string;
  priority?: string;
  memberRole?: string;
}

function Badge({ className, variant, status, priority, memberRole, ...props }: BadgeProps) {
  let style = "";

  if (memberRole && roleStyles[memberRole]) {
    style = roleStyles[memberRole];
  } else if (status && statusStyles[status]) {
    style = statusStyles[status];
  } else if (priority && priorityStyles[priority]) {
    style = priorityStyles[priority];
  }

  if (style) {
    return <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold", style, className)} {...props} />;
  }

  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };