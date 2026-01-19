import React from 'react';
import Icon, { IconProps } from './Icon';

type StickerProps = {
  label: string;
  icon?: IconProps['name'];
  className?: string;
  color?: string;
};

const Sticker: React.FC<StickerProps> = ({ label, icon = 'platform', className = '', color = '#2563eb' }) => {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full`} style={{ backgroundColor: `${color}20` }}>
      <Icon name={icon} size={16} color={color} />
      <span className={`text-xs font-bold`} style={{ color }}>{label}</span>
    </div>
  );
};

export default Sticker;