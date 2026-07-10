import React from 'react';
import { motion } from 'motion/react';

export type RevealVariant = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
}: ScrollRevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
