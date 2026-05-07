"use client";

import { useState, useEffect } from "react";
import { FaCode } from "react-icons/fa";

export default function IconByName({ name, className, size = 20, fallbackToDefault = true }) {
  const [Comp, setComp] = useState(null);
  const [found, setFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!name) {
      if (fallbackToDefault) setComp(() => FaCode);
      else setComp(null);
      setFound(Boolean(fallbackToDefault));
      return () => (mounted = false);
    }

    import("react-icons/fa")
      .then((mod) => {
        if (!mounted) return;
        const C = mod[name];
        if (C) {
          setComp(() => C);
          setFound(true);
        } else if (fallbackToDefault) {
          setComp(() => FaCode);
          setFound(false);
        } else {
          setComp(null);
          setFound(false);
        }
      })
      .catch(() => {
        if (!mounted) return;
        if (fallbackToDefault) {
          setComp(() => FaCode);
          setFound(false);
        } else {
          setComp(null);
          setFound(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [name, fallbackToDefault]);

  if (!Comp) return (
    <div style={{ width: size, height: size }} aria-hidden />
  );
  return <Comp className={className} size={size} data-found={found} />;
}
