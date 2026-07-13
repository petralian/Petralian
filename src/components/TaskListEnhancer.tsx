"use client";

import { useEffect } from "react";

type TaskListEnhancerProps = {
  slug: string;
};

function storageKey(slug: string, index: number): string {
  return `petralian:task:${slug}:${index}`;
}

export default function TaskListEnhancer({ slug }: TaskListEnhancerProps) {
  useEffect(() => {
    const prose = document.querySelector(".article-body-main .prose");
    if (!prose) return;

    const items = prose.querySelectorAll<HTMLLIElement>(
      "li.task-list-item, li:has(> input[type='checkbox'])",
    );

    const cleanups: Array<() => void> = [];

    items.forEach((li, index) => {
      const input = li.querySelector<HTMLInputElement>("input[type='checkbox']");
      if (!input) return;

      input.disabled = false;
      input.removeAttribute("disabled");

      const saved = localStorage.getItem(storageKey(slug, index));
      if (saved === "1") input.checked = true;

      const sync = () => {
        li.classList.toggle("task-list-item--checked", input.checked);
        localStorage.setItem(storageKey(slug, index), input.checked ? "1" : "0");
      };

      sync();
      input.addEventListener("change", sync);
      cleanups.push(() => input.removeEventListener("change", sync));
    });

    return () => {
      for (const off of cleanups) off();
    };
  }, [slug]);

  return null;
}
