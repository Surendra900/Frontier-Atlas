"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const updateContainer = () => {
      const el = document.getElementById("scroll-container");

      if (el) {
        let target = document.getElementById("footer-portal-target");

        if (!target) {
          target = document.createElement("div");
          target.id = "footer-portal-target";
          el.appendChild(target);
        } else if (target.parentElement !== el) {
          el.appendChild(target);
        } else if (el.lastElementChild !== target) {
          el.appendChild(target);
        }

        setContainer((prev) =>
          prev !== target ? target : prev
        );
      } else {
        setContainer(null);
      }
    };

    updateContainer();

    const observer = new MutationObserver(() => {
      updateContainer();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [pathname]);

  if (container) {
    return createPortal(<Footer />, container);
  }

  return <Footer />;
}