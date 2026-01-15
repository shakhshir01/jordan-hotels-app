import { useEffect } from 'react';

export const useSEO = ({ title, description, image, url, type = 'website' }) => {
  useEffect(() => {
    // Update document title
    document.title = title || 'VisitJo - Jordan Hotels';

    // Update meta tags
    updateMetaTag('description', description || 'Book the best hotels in Jordan with VisitJo. Find great deals and read reviews.');
    updateMetaTag('og:title', title || 'VisitJo - Jordan Hotels');
    updateMetaTag('og:description', description || 'Book the best hotels in Jordan with VisitJo.');
    updateMetaTag('og:image', image || 'https://visitjo.com/og-image.jpg');
    updateMetaTag('og:url', url || window.location.href);
    updateMetaTag('og:type', type);
    updateMetaTag('twitter:title', title || 'VisitJo - Jordan Hotels');
    updateMetaTag('twitter:description', description || 'Book the best hotels in Jordan with VisitJo.');
    updateMetaTag('twitter:image', image || 'https://visitjo.com/og-image.jpg');
    updateMetaTag('twitter:card', 'summary_large_image');

    // Structured data for hotels
    if (type === 'hotel') {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: title,
        description: description,
        image: image,
        url: url,
      };
      updateSchemaTag(schema);
    }
  }, [title, description, image, url, type]);
};

const updateMetaTag = (name, content) => {
  let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    const attr = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
      /** @type {HTMLMetaElement} */ (element).setAttribute(attr, name);
    document.head.appendChild(element);
  }
    /** @type {HTMLMetaElement} */ (element).setAttribute('content', content);
};

const updateSchemaTag = (schema) => {
  let element = document.querySelector('script[type="application/ld+json"]');
  if (!element) {
    element = document.createElement('script');
      /** @type {HTMLScriptElement} */ (element).type = 'application/ld+json';
    document.head.appendChild(element);
  }
    /** @type {HTMLScriptElement} */ (element).textContent = JSON.stringify(schema);
};

export const SEOMeta = ({ title, description, image, url, type, children }) => {
  useSEO({ title, description, image, url, type });
  return children;
};

export default useSEO;
