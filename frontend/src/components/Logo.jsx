import { useState } from 'react';
import { Link } from 'react-router-dom';
import FaIcon from './FaIcon';

/** Logo file: frontend/public/logo.png */
const LOGO_FILES = ['logo.svg', 'logo.png', 'logo.webp', 'logo.jpg'];

export default function Logo({
  className = 'h-10 w-auto max-w-[180px] object-contain',
  showText = true,
  textClassName = '',
  linkToHome = true,
  lightText = false,
}) {
  const base = import.meta.env.BASE_URL;
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const src = `${base}${LOGO_FILES[srcIndex]}`;

  const handleError = () => {
    if (srcIndex < LOGO_FILES.length - 1) {
      setSrcIndex((i) => i + 1);
    } else {
      setFailed(true);
    }
  };

  const image = !failed ? (
    <img
      key={src}
      src={src}
      alt="The Urban Physio"
      className={`${className} group-hover:scale-105 transition-transform`}
      onError={handleError}
    />
  ) : (
    <div className="w-10 h-10 bg-primary-600/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg shrink-0">
      <FaIcon icon="fa-heart-pulse" className="text-white text-lg" />
    </div>
  );

  const text = showText && (
    <span
      className={`font-bold text-xl hidden sm:block ${
        lightText
          ? 'text-white'
          : 'bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent'
      }`}
    >
      The Urban Physio
    </span>
  );

  const content = (
    <>
      {image}
      {text}
    </>
  );

  if (!linkToHome) {
    return <div className={`flex items-center gap-3 ${textClassName}`}>{content}</div>;
  }

  return (
    <Link to="/" className={`flex items-center gap-3 group ${textClassName}`}>
      {content}
    </Link>
  );
}
