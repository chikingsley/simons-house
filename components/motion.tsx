import { motion } from "motion/react";
import type React from "react";

// Fade in animation for page/section entry
export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className={className}
    initial={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.3, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Scale in animation for cards/modals
export const ScaleIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => (
  <motion.div
    animate={{ opacity: 1, scale: 1 }}
    className={className}
    initial={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Slide in from right (for sidebars, panels)
export const SlideInRight: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    animate={{ opacity: 1, x: 0 }}
    className={className}
    initial={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// Staggered list animation container
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = "", staggerDelay = 0.05 }) => (
  <motion.div
    animate="visible"
    className={className}
    initial="hidden"
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

// Staggered list item
export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    {children}
  </motion.div>
);

// Button hover animation wrapper
export const HoverScale: React.FC<{
  children: React.ReactNode;
  className?: string;
  scale?: number;
}> = ({ children, className = "", scale = 1.02 }) => (
  <motion.div
    className={className}
    transition={{ duration: 0.15 }}
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);

// Page transition wrapper
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    animate={{ opacity: 1 }}
    className={className}
    exit={{ opacity: 0 }}
    initial={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// Re-export motion for custom animations
export { motion } from "motion/react";
