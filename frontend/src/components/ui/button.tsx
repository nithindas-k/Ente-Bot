import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/10",
        destructive:
          "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/10",
        outline:
          "border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white",
        secondary:
          "bg-neutral-800 text-neutral-100 hover:bg-neutral-700",
        ghost: "text-neutral-400 hover:text-white hover:bg-neutral-900",
        link: "text-emerald-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    useGSAP(() => {
        if (buttonRef.current && !props.disabled) {
            const el = buttonRef.current;
            
            const onMouseEnter = () => {
                gsap.to(el, { 
                    scale: 1.02, 
                    y: -1,
                    duration: 0.3, 
                    ease: "power2.out" 
                });
            };
            
            const onMouseLeave = () => {
                gsap.to(el, { 
                    scale: 1, 
                    y: 0,
                    duration: 0.3, 
                    ease: "power2.out" 
                });
            };

            const onMouseDown = () => {
                gsap.to(el, { scale: 0.96, duration: 0.1 });
            };

            const onMouseUp = () => {
                gsap.to(el, { scale: 1.02, duration: 0.2 });
            };

            el.addEventListener("mouseenter", onMouseEnter);
            el.addEventListener("mouseleave", onMouseLeave);
            el.addEventListener("mousedown", onMouseDown);
            el.addEventListener("mouseup", onMouseUp);

            return () => {
                el.removeEventListener("mouseenter", onMouseEnter);
                el.removeEventListener("mouseleave", onMouseLeave);
                el.removeEventListener("mousedown", onMouseDown);
                el.removeEventListener("mouseup", onMouseUp);
            };
        }
    }, { scope: buttonRef });

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={(node) => {
          // Handle both forwarded ref and internal ref
          if (typeof ref === "function") ref(node as HTMLButtonElement);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node as HTMLButtonElement;
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node as HTMLButtonElement;
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
