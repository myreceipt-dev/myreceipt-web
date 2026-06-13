"use client";

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: { index: number; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-start justify-center">
      {steps.map((s, i) => (
        <div key={s.index} className="flex items-start">
          {/* Circle + label */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors",
                currentStep > s.index &&
                  "bg-primary border-primary text-primary-foreground",
                currentStep === s.index &&
                  "border-primary text-primary bg-primary/10",
                currentStep < s.index &&
                  "border-muted-foreground/25 text-muted-foreground"
              )}
            >
              {currentStep > s.index ? (
                <Check className="h-4 w-4" />
              ) : (
                s.index
              )}
            </div>
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                currentStep >= s.index
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="flex items-start pt-[18px] px-2">
              <div
                className={cn(
                  "h-0.5 w-10 sm:w-16 md:w-20 rounded-full transition-colors",
                  currentStep > s.index ? "bg-primary" : "bg-muted"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
