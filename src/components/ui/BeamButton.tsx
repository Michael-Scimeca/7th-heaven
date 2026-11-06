"use client";

import React from "react";
import Link from "next/link";
import styles from "./BeamButton.module.css";

type BeamButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  href?: string;
};

export default function BeamButton({
  size = "sm",
  href,
  className = "",
  type = "button",
  children,
  ...props
}: BeamButtonProps) {
  const classes = `${styles.button} ${styles[size]} ${className}`.trim();

  return (
    <span className={styles.beam}>
      {href ? (
        <Link href={href} className={classes}>
          {children}
        </Link>
      ) : (
        <button type={type} className={classes} {...props}>
          {children}
        </button>
      )}
      <span aria-hidden="true" className={styles.bloom} />
    </span>
  );
}
