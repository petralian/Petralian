"use client";

import { Children, isValidElement, useCallback, useState, type ReactNode } from "react";

function extractCode(children: ReactNode): string {
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ children?: ReactNode }>(child)) {
    return typeof children === "string" ? children : "";
  }
  const inner = child.props.children;
  if (typeof inner === "string") return inner.replace(/\n$/, "");
  if (Array.isArray(inner)) {
    return inner
      .map((part) => (typeof part === "string" ? part : ""))
      .join("")
      .replace(/\n$/, "");
  }
  return "";
}

type CodeBlockProps = {
  children: ReactNode;
  className?: string;
};

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = extractCode(children);
  const lines = code.split("\n");

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [code]);

  return (
    <div className="code-block">
      <button
        type="button"
        className="code-block__copy"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className={`code-block__pre${className ? ` ${className}` : ""}`}>
        <code>
          {lines.map((line, index) => (
            <span className="code-block__row" key={index}>
              <span className="code-block__ln" aria-hidden="true">
                {index + 1}
              </span>
              <span className="code-block__text">{line}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
