import { Helmet } from 'react-helmet-async';

const Seo = ({
  title,
  description,
  canonicalUrl,
  jsonLd = null,
  keywords = null,
  image = null,
  type = 'website',
  noindex = false,
  structuredData = [],
  breadcrumbs = []
}) => {
  const fullTitle = title ? `${title} | VISIT-JO` : 'VISIT-JO | Discover Jordan\'s Best Hotels & Experiences';
  const metaDescription = description || 'Book authentic hotels, explore ancient wonders, and create unforgettable memories in Jordan. From Petra to Wadi Rum, your adventure starts here.';
  const metaImage = image || 'https://VISIT-JO.com/og-image.jpg';
  const metaKeywords = keywords || 'Jordan hotels, Jordan travel, Petra, Wadi Rum, Dead Sea, Amman hotels, Jordan experiences, Jordan booking';

  // Combine all structured data
  const allJsonLd = Array.isArray(structuredData) ? structuredData : [];
  if (jsonLd) {
    allJsonLd.push(jsonLd);
  }

  // Add breadcrumb structured data if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
    allJsonLd.push(breadcrumbJsonLd);
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content="VISIT-JO" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl || 'https://VISIT-JO.com'} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="VISIT-JO" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Additional SEO meta tags */}
      <meta name="theme-color" content="#0b1220" />
      <meta name="msapplication-TileColor" content="#0b1220" />

      {/* Structured Data */}
      {allJsonLd.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;