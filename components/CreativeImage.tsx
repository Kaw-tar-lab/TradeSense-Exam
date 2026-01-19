import React from 'react';

type Props = {
  seed?: string;
  width?: number;
  height?: number;
  className?: string;
  rounded?: boolean;
  provider?: 'loremflickr' | 'unsplash';
  topic?: string | string[]; // finance/trading keywords
  grayscale?: boolean;
};

const CreativeImage: React.FC<Props> = ({
  seed,
  width = 400,
  height = 240,
  className = '',
  rounded = true,
  provider = 'loremflickr',
  topic = ['finance', 'trading', 'stocks', 'market', 'chart'],
  grayscale = false,
}) => {
  const keywords = Array.isArray(topic) ? topic.join(',') : topic;

  let src = '';
  if (provider === 'loremflickr') {
    const lock = seed ? `?lock=${encodeURIComponent(seed)}` : '';
    const gs = grayscale ? '/grayscale' : '';
    src = `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}${gs}${lock}`;
  } else {
    const base = `https://source.unsplash.com/random/${width}x${height}`;
    const query = keywords ? `?${encodeURIComponent(keywords)}` : '';
    src = `${base}${query}`;
  }

  return (
    <div className={`overflow-hidden ${rounded ? 'rounded-xl' : ''} bg-slate-800 ${className}`} style={{ width: '100%' }}>
      <img src={src} alt="Illustration trading/finance" className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
};

export default CreativeImage;