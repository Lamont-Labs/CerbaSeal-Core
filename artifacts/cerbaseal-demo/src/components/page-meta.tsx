import { Helmet } from "react-helmet-async";

const OG_IMAGE = "/opengraph.jpg";
const SITE_NAME = "CerbaSeal";

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
}

export function PageMeta({ title, description, path, ogTitle, ogDescription }: PageMetaProps) {
  const canonicalBase = (() => {
    try {
      const base = (import.meta as Record<string, any>)?.env?.VITE_CANONICAL_BASE_URL as string | undefined;
      return base ? base.replace(/\/$/, "") : "https://cerbaseal.lamontlabs.io";
    } catch {
      return "https://cerbaseal.lamontlabs.io";
    }
  })();

  const fullTitle = `${title} – ${SITE_NAME}`;
  const resolvedOgTitle = ogTitle ?? fullTitle;
  const resolvedOgDesc = ogDescription ?? description;
  const canonicalUrl = `${canonicalBase}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
}
