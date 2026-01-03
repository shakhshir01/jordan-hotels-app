import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

export default function BlogPost() {
  const { slug } = useParams();

  const title = useMemo(() => {
    if (!slug) return "Post";
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }, [slug]);

  return (
    <div>
      <div className="u-row u-between u-wrap">
        <div>
          <div className="h2">{title}</div>
          <p className="p u-mt-2">Placeholder article page (later: CMS/markdown rendering, SEO meta, related posts).</p>
        </div>
        <Link className="btn btn--ghost" to="/blog">Back to blog</Link>
      </div>

      <div className="u-mt-6 card">
        <div className="card__body">
          <p className="p">Replace with real content.</p>
        </div>
      </div>
    </div>
  );
}
