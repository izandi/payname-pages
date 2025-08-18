import type { Metadata } from "next"
import DomainLandingPage from "@/components/domain-landing-page"

interface DomainPageProps {
  params: {
    domain: string
  }
}

export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const domain = params.domain

  // TODO: Fetch domain data and customization from database

  return {
    title: `${domain} - Payname Pages`,
    description: `Send payments and messages to ${domain}`,
    openGraph: {
      title: `${domain} - Payname Pages`,
      description: `Send payments and messages to ${domain}`,
      url: `/${domain}`,
      siteName: "Payname Pages",
      images: [
        {
          url: `/api/og/${domain}`,
          width: 1200,
          height: 630,
          alt: `${domain} payment page`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${domain} - Payname Pages`,
      description: `Send payments and messages to ${domain}`,
      images: [`/api/og/${domain}`],
    },
  }
}

export default async function DomainPage({ params }: DomainPageProps) {
  const domain = params.domain

  // TODO: Fetch domain data from database
  // Check if domain exists and is verified

  // For now, render the landing page component
  return <DomainLandingPage domain={domain} />
}
