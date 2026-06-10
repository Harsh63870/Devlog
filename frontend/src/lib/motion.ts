import type { Transition, Variants } from "framer-motion";

/** Shared spring used for interactive elements. */
export const spring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

/** Soft spring for larger surfaces (panels, pages). */
export const softSpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 28,
};

/** Page-level transition variants. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...softSpring, staggerChildren: 0.06 },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

/** Staggered container — children animate in sequence. */
export const staggerContainer: Variants = {
  initial: {},
  enter: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Card / item entry. */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: softSpring },
};

/** Slide in from the right (right panel items). */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 16 },
  enter: { opacity: 1, x: 0, transition: spring },
};

/** Scale pop for badges/pills. */
export const pop: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  enter: { opacity: 1, scale: 1, transition: spring },
};

/** Hover lift for interactive cards. */
export const hoverLift = {
  whileHover: { y: -3, transition: spring },
  whileTap: { scale: 0.99 },
};
