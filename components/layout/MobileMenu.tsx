"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { site } from "@/data/site";

const links = [
  { label: "Skills", href: "/#skills" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/#contact" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-nav">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </button>
      {open ? (
        <nav id="mobile-navigation" className="mobile-menu-panel" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <Link href={site.cvUrl} className="button button-primary" onClick={() => setOpen(false)}>
            Download CV
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
