import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { Size } from "../models/charts";

export function useContainerSize<T extends HTMLElement>(
  ref: RefObject<T>,
): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);

      // skip the update if nothing changed
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
