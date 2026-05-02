"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TypingText = ({ 
  text, 
  className, 
  delay = 0,
  duration = 0.05,
  stagger = 0.05,
  as: Component = "span" 
}) => {
  const words = text.split(" ");
  
  return (
    <Component className={cn("inline", className)}>
      {words.map((word, i) => {
        // Calculate the starting character index for this word to maintain continuous timing
        const previousCharsCount = words.slice(0, i).join("").length + i;
        
        return (
          <span key={i} className="inline-block whitespace-nowrap">
            {word.split("").map((char, j) => (
              <motion.span
                key={j}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: duration,
                  delay: delay + ((previousCharsCount + j) * stagger),
                  ease: "easeIn"
                }}
              >
                {char}
              </motion.span>
            ))}
            {i < words.length - 1 && <span>&nbsp;</span>}
          </span>
        );
      })}
    </Component>
  );
};
