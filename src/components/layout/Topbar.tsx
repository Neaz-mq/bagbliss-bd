"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = [
  "✨ New Arrivals — Explore the latest collection",
  "📦 Cash on Delivery available all over Bangladesh",
  "🔒 100% Secure Payments — Shop with confidence",
];

const INTERVAL = 4000;

export default function Topbar() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, INTERVAL);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const variants = {
    enter:  { y: 14, opacity: 0 },
    center: { y: 0,  opacity: 1 },
    exit:   { y: -14, opacity: 0 },
  };

  return (
  <div className="relative bg-[#f4f0eb] border-b border-[#e0d8d0] overflow-hidden flex items-center min-h-[36px] py-1 sm:py-0 sm:h-9 px-12">
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.3, ease: "easeOut" },
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-12"
      >
        <span className="
          text-[10px] sm:text-[11.5px]
          tracking-[0.13em] sm:tracking-[0.15em]
          uppercase font-semibold text-[#808084] select-none
          text-center leading-tight
          line-clamp-1
        ">
          {MESSAGES[index]}
        </span>
      </motion.div>
    </AnimatePresence>
  </div>
);
}