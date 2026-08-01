import React from 'react';

const SpriteIcon = ({ icon, className, style }) => (
  <span
    className={className}
    aria-hidden="true"
    style={{
      display: 'inline-block',
      flexShrink: 0,
      width: icon.width,
      height: icon.height,
      backgroundImage: `url(${icon.sprite})`,
      backgroundPosition: icon.bgPosition,
      backgroundSize: icon.bgSize,
      backgroundRepeat: 'no-repeat',
      ...style,
    }}
  />
);

export default SpriteIcon;
