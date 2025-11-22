// src/app/(public)/layout.tsx
import HeaderFooterWrapper from "@/components/HeaderFooterWrapper";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <HeaderFooterWrapper>{children}</HeaderFooterWrapper>;
}
