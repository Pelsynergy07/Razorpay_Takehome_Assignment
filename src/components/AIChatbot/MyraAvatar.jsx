import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const MyraAvatar = ({ size = 28, style }) => (
  <div
    style={{
      width: size,
      height: size,
      aspectRatio: '1 / 1',
      flexShrink: 0,
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  >
    <DotLottieReact
      src="/ghost-smart.json"
      loop
      autoplay
      renderConfig={{
        fit: 'contain',
      }}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'contain',
      }}
    />
  </div>
);

export default MyraAvatar;
