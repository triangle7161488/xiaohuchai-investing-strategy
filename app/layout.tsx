import type { Metadata } from "next";
import "./globals.css";
import "./theme-overrides.css";

export const metadata: Metadata = {
  title: "小虎柴柴长期投资策略 / 让复利跑，先让自己睡得着",
  description: "一份写给普通投资者的美股宽基投资与抗波动指南。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
