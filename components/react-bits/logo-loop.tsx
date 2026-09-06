"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type LogoLoopItem = {
  node: ReactNode;
  label: string;
};

type LogoLoopProps = {
  items: LogoLoopItem[];
  speed?: number;
  gap?: number;
  pauseOnHover?: boolean;
  className?: string;
};

export function LogoLoop({
  items,
  speed = 54,
  gap = 72,
  pauseOnHover = true,
  className = "",
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLUListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const [sequenceWidth, setSequenceWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(2);
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const width = sequenceRef.current?.getBoundingClientRect().width ?? 0;
    if (width <= 0) return;

    setSequenceWidth(Math.ceil(width));
    setCopyCount(Math.max(2, Math.ceil(containerWidth / width) + 2));
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    if (sequenceRef.current) observer.observe(sequenceRef.current);
    measure();
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const track = trackRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!track || sequenceWidth <= 0 || reduceMotion) return;

    const animate = (timestamp: number) => {
      const previous = lastFrameRef.current ?? timestamp;
      const delta = Math.min((timestamp - previous) / 1000, 0.1);
      lastFrameRef.current = timestamp;
      if (!paused) offsetRef.current = (offsetRef.current + speed * delta) % sequenceWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastFrameRef.current = null;
    };
  }, [paused, sequenceWidth, speed]);

  const copies = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className="logo-loop__list"
          // biome-ignore lint/suspicious/noArrayIndexKey: repeated visual sequences have no independent identity
          key={`provider-sequence-${copyIndex}`}
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? sequenceRef : undefined}
          style={{ "--logo-loop-gap": `${gap}px` } as CSSProperties}
        >
          {items.map((item) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: each logo is duplicated per visual sequence
            <li className="logo-loop__item" key={`${copyIndex}-${item.label}`}>
              {item.node}
            </li>
          ))}
        </ul>
      )),
    [copyCount, gap, items],
  );

  return (
    <section
      ref={containerRef}
      className={`logo-loop ${className}`}
      aria-label="Payment and billing providers"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div className="logo-loop__track" ref={trackRef}>
        {copies}
      </div>
    </section>
  );
}
