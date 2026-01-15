import { useEffect } from 'react';

const Seo = ({ title, description, canonicalUrl, jsonLd }) => {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      /** @type {HTMLMetaElement} */ (metaDescription).name = 'description';
      document.head.appendChild(metaDescription);
    }
    if (description) {
      /** @type {HTMLMetaElement} */ (metaDescription).content = description;
    }

    // Set canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      /** @type {HTMLLinkElement} */ (canonicalLink).rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    if (canonicalUrl) {
      /** @type {HTMLLinkElement} */ (canonicalLink).href = canonicalUrl;
    }

    // Add JSON-LD structured data
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        /** @type {HTMLScriptElement} */ (script).type = 'application/ld+json';
        document.head.appendChild(script);
      }
      /** @type {HTMLScriptElement} */ (script).textContent = JSON.stringify(jsonLd);
    }

    // Cleanup function
    return () => {
      // Reset title if needed
      if (title) {
        document.title = 'VisitJo - Discover Jordan';
      }
    };
  }, [title, description, canonicalUrl, jsonLd]);

  return null; // This component doesn't render anything
};

export default Seo;