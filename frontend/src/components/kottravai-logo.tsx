import type { ImgHTMLAttributes } from "react";
import logoImg from "../WhatsApp Image 2026-06-08 at 11.23.10 AM (2).jpg";

export function KottravaiLogo({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={logoImg}
      alt="Kottravai Logo"
      className={`object-contain rounded-full ${className || ""}`}
      {...props}
    />
  );
}
