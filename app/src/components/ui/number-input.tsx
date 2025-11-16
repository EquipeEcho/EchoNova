import React, { useRef } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function NumberInput({ className: inputClassName, step, min, max, onChange, ...props }: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const coerceNumber = (val: string) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  const clamp = (n: number) => {
    const hasMin = typeof min !== "undefined" && min !== null;
    const hasMax = typeof max !== "undefined" && max !== null;
    if (hasMin) n = Math.max(n, Number(min));
    if (hasMax) n = Math.min(n, Number(max));
    return n;
  };

  const triggerChange = (next: number) => {
    const el = inputRef.current;
    if (!el) return;
    el.value = String(next);
    // Dispara evento 'input' para que o React onChange capture
    const evt = new Event("input", { bubbles: true });
    el.dispatchEvent(evt);
  };

  const handleStep = (dir: 1 | -1) => {
    const el = inputRef.current;
    if (!el) return;
    const current = coerceNumber(el.value || String((props.value ?? "")));
    const s = Number(step ?? 1);
    const next = clamp(current + dir * s);
    triggerChange(next);
  };

  return (
    <div className={cn("relative inline-flex w-full") }>
      <Input
        {...props}
        ref={inputRef as any}
        type="number"
        step={step}
        min={min as any}
        max={max as any}
        onChange={onChange}
        className={cn("pr-10", inputClassName)}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-8 flex flex-col overflow-hidden rounded-md border border-slate-600/60 bg-slate-800/20 backdrop-blur-[1px]">
        <button
          type="button"
          aria-label="Incrementar"
          className="h-1/2 grid place-items-center text-slate-300 hover:text-pink-300 hover:bg-pink-500/10 transition-colors"
          onClick={() => handleStep(1)}
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <div className="h-px bg-slate-600/60" />
        <button
          type="button"
          aria-label="Decrementar"
          className="h-1/2 grid place-items-center text-slate-300 hover:text-pink-300 hover:bg-pink-500/10 transition-colors"
          onClick={() => handleStep(-1)}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
