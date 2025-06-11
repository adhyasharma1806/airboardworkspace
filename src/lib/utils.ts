// Tailwind class merging utility
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function classifyGesture(landmarks: any[]): string {
  console.log("classifyGesture() was called!", landmarks); // <-- Important!
  return "DebugGesture";
}
