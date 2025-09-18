// Simple Slot implementation to replace @radix-ui/react-slot
import React, { forwardRef, ReactElement, cloneElement } from 'react';

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    return cloneElement(children as ReactElement, {
      ...props,
      ...children.props,
      ref,
    });
  }

  return <span ref={ref} {...props}>{children}</span>;
});

Slot.displayName = 'Slot';