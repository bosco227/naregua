import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const baseUrl = new URL(`${protocol}://${host}`);

  return {
    metadataBase: baseUrl,
    title: "NaRégua — encontre seu próximo barbeiro",
    description:
      "Compare especialidades, experiência e horários de barbeiros perto de você.",
    openGraph: {
      title: "NaRégua — seu próximo corte, sem surpresa.",
      description: "Profissionais, experiência e horários livres no mapa.",
      images: [new URL("/og.png", baseUrl).toString()],
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "NaRégua",
      description: "Seu próximo corte, sem surpresa.",
      images: [new URL("/og.png", baseUrl).toString()],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
