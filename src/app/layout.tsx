import type { Metadata } from 'next'
import '../index.css'
 
import { getCachedGlobalConfig } from '@/lib/seo-service'
import { SeoScripts } from '@/components/SeoScripts'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getCachedGlobalConfig()
  if (!config) {
    return {
      title: 'My App',
      description: 'My App is a...',
    }
  }

  return {
    title: {
      default: config.defaultTitle || 'My App',
      template: config.titleTemplate || '%s',
    },
    description: config.defaultDescription || config.description || 'My App is a...',
    openGraph: {
      title: config.defaultTitle || 'My App',
      description: config.defaultDescription || config.description || 'My App is a...',
      images: config.defaultImage ? [{ url: config.defaultImage }] : [],
      siteName: config.siteName,
      locale: config.locale,
    },
    verification: {
      google: config.googleSiteVerificationId || undefined,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = await getCachedGlobalConfig()

  return (
    <html lang={config?.locale || 'en'}>
      <head>
        {config?.schemaMarkup && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: config.schemaMarkup }}
          />
        )}
      </head>
      <body>
        <SeoScripts
          header={config?.scripts?.header}
          bodyStart={config?.scripts?.bodyStart}
          bodyEnd={config?.scripts?.bodyEnd}
        />
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
