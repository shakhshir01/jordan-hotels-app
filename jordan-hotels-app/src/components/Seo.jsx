import { useEffect } from 'react';

const ensureMetaByName = (name) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  return tag;
};

const ensureCanonicalLink = () => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  return link;
};

export default function Seo({ title, description, canonicalUrl, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      const meta = ensureMetaByName('description');
      meta.setAttribute('content', description);
    }

    if (canonicalUrl) {
      const canonical = ensureCanonicalLink();
      canonical.setAttribute('href', canonicalUrl);
    }
  }, [title, description, canonicalUrl]);

  useEffect(() => {
    if (!jsonLd) return;

    const scripts = [];
    const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

    for (const entry of items) {
      const payload = typeof entry === 'string' ? entry : JSON.stringify(entry);
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-visitjo-jsonld', 'true');
      script.text = payload;
      document.head.appendChild(script);
      scripts.push(script);
    }

    return () => {
      for (const script of scripts) {
        script.parentNode?.removeChild(script);
      }
    };
  }, [jsonLd]);

  return null;
}
