import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  /** Kept for API compatibility; the image already renders on a navy plate. */
  white?: boolean;
  className?: string;
};

export function Logo({ size = 28, className }: Props) {
  return (
    <Image
      src="/gography-logo.jpg"
      alt="GoGraphy"
      width={size}
      height={size}
      priority={size >= 36}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
