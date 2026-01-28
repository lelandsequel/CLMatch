export const tokens = {
  type: {
    h1: "text-[42px] leading-tight md:text-[54px]",
    h2: "text-[30px] leading-snug md:text-[36px]",
    h3: "text-[22px] leading-snug",
    body: "text-[16px] leading-relaxed",
    muted: "text-[14px] text-slate-500"
  },
  spacing: {
    section: "py-16 md:py-24",
    card: "p-6",
    gap: "gap-6"
  },
  radius: {
    card: "rounded-xl",
    pill: "rounded-full"
  },
  shadow: {
    card: "shadow-card",
    glow: "shadow-glow"
  }
} as const;
