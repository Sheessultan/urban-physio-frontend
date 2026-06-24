import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import { physioFeed } from '../services/api';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { cmsContentToHtml } from '../utils/htmlContent';

function mediaSrc(url) {
  return resolveMediaUrl(url) || url;
}

export default function PhysioFeedDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'PhysioFeed | The Urban Physio';
    physioFeed
      .get(slug)
      .then((res) => {
        const p = res.data ?? res;
        setPost(p);
        if (p.seo_title) document.title = p.seo_title;
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <p className="text-slate-600">Article not found.</p>
          <Link to="/physiofeed" className="btn-primary mt-4 inline-block">
            Back to PhysioFeed
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const audioSrc = mediaSrc(post.audio_url);
  const videoSrc = mediaSrc(post.video_url);
  const isPodcast = post.type === 'podcast';

  return (
    <>
      <Navbar />
      {post.featured_image && (
        <div className="pt-16 sm:pt-20">
          <div className="h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-slate-200">
            <img
              src={mediaSrc(post.featured_image)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      <article className={`max-w-3xl mx-auto px-4 pb-16 ${post.featured_image ? 'pt-8' : 'pt-24'}`}>
        <Link to="/physiofeed" className="text-sm text-indigo-600 font-semibold inline-flex items-center gap-1 mb-6">
          <FaIcon icon="fa-arrow-left" /> Back to PhysioFeed
        </Link>
        <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{post.type}</span>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-3">{post.title}</h1>
        <p className="text-sm text-slate-500 mt-2">
          {post.author_name}
          {post.published_at ? ` · ${post.published_at.slice(0, 10)}` : ''}
        </p>

        {isPodcast && (videoSrc || audioSrc) && (
          <div className="glass-card p-4 sm:p-5 mt-6 space-y-4 border border-rose-100">
            <p className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <FaIcon icon="fa-podcast" className="text-rose-600" />
              Listen or watch
            </p>
            {videoSrc && (
              <video controls className="w-full max-h-[420px] rounded-xl bg-black shadow-lg" src={videoSrc}>
                <track kind="captions" />
              </video>
            )}
            {audioSrc && (
              <audio controls className="w-full" src={audioSrc}>
                <track kind="captions" />
              </audio>
            )}
          </div>
        )}

        <div
          className="cms-prose max-w-none mt-8"
          dangerouslySetInnerHTML={{ __html: cmsContentToHtml(post.content) }}
        />
      </article>
      <Footer />
    </>
  );
}
