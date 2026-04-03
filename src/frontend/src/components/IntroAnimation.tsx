import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [show, setShow] = useState(() => {
    if (sessionStorage.getItem("nn_intro_shown")) return false;
    sessionStorage.setItem("nn_intro_shown", "1");
    return true;
  });

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 3500);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.img
            src="/assets/generated/naughty-network-logo.dim_300x80-transparent.png"
            alt="Naughty Network"
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "min(500px, 80vw)",
              filter:
                "drop-shadow(0 0 50px rgba(220, 20, 60, 0.95)) drop-shadow(0 0 20px rgba(220, 20, 60, 0.6))",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
