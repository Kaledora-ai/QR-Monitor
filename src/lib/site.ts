export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");
export const BUY_URL = process.env.NEXT_PUBLIC_BUY_CREDITS_URL || "";
export const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

export const COSTS = { temp: 3, permanent: 10, design: 2, renew: 3, signup: 10 };

export const PACKAGES = [
  { credits: 30, price: "14,90", per: "0,50", tag: "Para começar" },
  { credits: 100, price: "39,90", per: "0,40", tag: "Mais escolhido", featured: true },
  { credits: 300, price: "99,90", per: "0,33", tag: "Para agências" },
];

export function qrCost(dynamic: boolean, permanent: boolean, design: boolean) {
  if (!dynamic) return 0;
  return (permanent ? COSTS.permanent : COSTS.temp) + (design ? COSTS.design : 0);
}
