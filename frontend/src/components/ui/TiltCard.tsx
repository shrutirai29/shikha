import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * TiltCard — a subtle 3D perspective tilt that follows the pointer.
 * Pure CSS 3D (no WebGL), used to give product imagery gentle depth.
 */
export const TiltCard = ({
  children,
  className,
  maxTilt = 8,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 160,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 160,
    damping: 22,
  });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    const rect = ref.current?.getBoundingClientRect();

    if (!rect) return;

    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
};
