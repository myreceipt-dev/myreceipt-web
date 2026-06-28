"use client";

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

interface StepConfig {
  index: number;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-start justify-center">
      {steps.map((s, i) => {
        const isDone = currentStep > s.index;
        const isCurrent = currentStep === s.index;
        const Icon = s.icon;

        return (
          <div key={s.index} className="flex items-start">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors",
                  isDone &&
                    "bg-emerald-500 border-emerald-500 text-white",
                  isCurrent &&
                    "border-primary text-primary bg-primary/10",
                  !isDone &&
                    !isCurrent &&
                    "border-muted-foreground/25 text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isDone && "text-emerald-600 font-medium",
                  isCurrent && "text-foreground font-medium",
                  !isDone && !isCurrent && "text-muted-foreground",
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
                    isDone && "bg-emerald-400",
                    !isDone && "bg-muted",
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
