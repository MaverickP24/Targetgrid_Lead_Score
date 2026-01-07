import { cn } from "@/lib/utils";

const VARIANTS = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  engaged: "bg-purple-100 text-purple-700 border-purple-200",
  qualified: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-gray-100 text-gray-700 border-gray-200",
};

export function LeadStatusBadge({ status }: { status: string }) {
  const variant = VARIANTS[status as keyof typeof VARIANTS] || VARIANTS.new;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variant
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
