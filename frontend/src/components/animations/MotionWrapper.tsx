'use client';

import { motion, MotionProps, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Fade in from bottom animation
export const FadeInUp = ({
  children,
  delay = 0,
  className = "",
  ...rest
}: MotionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

// Fade in from left animation
export const FadeInLeft = ({
  children,
  delay = 0,
  className = "",
  ...rest
}: MotionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

// Fade in from right animation
export const FadeInRight = ({
  children,
  delay = 0,
  className = "",
  ...rest
}: MotionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

// Simple fade in animation
export const FadeIn = ({
  children,
  delay = 0,
  className = "",
  ...rest
}: MotionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

// Scale up animation
export const ScaleUp = ({
  children,
  delay = 0,
  className = "",
  ...rest
}: MotionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation container
export const StaggerContainer = ({
  children,
  delay = 0,
  className = "",
  ...rest
}: MotionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay
          }
        }
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

// Staggered child item
export const StaggerItem = ({
  children,
  className = "",
  ...rest
}: MotionWrapperProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        }
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
