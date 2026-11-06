"use client";

/**
 * A pill that stretches apart into an email field and a button. The two colored shapes sit under an
 * SVG blur-and-threshold filter, which is what makes them neck and melt like liquid as they separate.
 * The text sits on a layer above, so it stays sharp.
 */

import { type FormEvent, useId, useRef, useState } from "react";

type Stage = "idle" | "open" | "done";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GooeyWaitlist() {
  const filterId = useId().replace(/:/g, "");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);

  const open = () => {
    setStage("open");
    window.setTimeout(() => inputRef.current?.focus(), 250);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setInvalid(true);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        rootRef.current?.animate(
          [0, -9, 8, -5, 3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
          { duration: 420, easing: "ease" },
        );
      }
      inputRef.current?.focus();
      return;
    }
    setInvalid(false);
    setStage("done");
  };

  return (
    <div ref={rootRef} className="goo" data-stage={stage}>
      <svg width="0" height="0" aria-hidden="true" className="goo-defs">
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
        </filter>
      </svg>

      <div className="goo-shapes" style={{ filter: `url(#${filterId})` }} aria-hidden="true">
        <span className="goo-field" />
        <span className="goo-action" />
      </div>

      {stage === "idle" && (
        <button type="button" className="goo-join" onClick={open}>
          Join the waitlist
        </button>
      )}

      {stage === "open" && (
        <form className="goo-form" onSubmit={submit} noValidate>
          <label className="goo-input">
            <span className="goo-sr">Email address</span>
            <input
              ref={inputRef}
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              aria-invalid={invalid}
              aria-describedby={invalid ? "goo-error" : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                setInvalid(false);
              }}
            />
            <span className="goo-letters" aria-hidden="true">
              {email.split("").map((letter, i) => (
                <span key={i}>{letter}</span>
              ))}
            </span>
          </label>
          <button type="submit" className="goo-submit">
            Join
          </button>
        </form>
      )}

      {stage === "done" && (
        <p className="goo-done" role="status">
          You&apos;re on the list
        </p>
      )}

      {invalid && (
        <p id="goo-error" className="goo-error" role="alert">
          Enter a full email address, like name@email.com.
        </p>
      )}
    </div>
  );
}
