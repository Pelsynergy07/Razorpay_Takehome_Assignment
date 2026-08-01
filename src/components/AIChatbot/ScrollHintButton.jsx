import React from 'react';
import { ChevronDown } from 'lucide-react';

const ScrollHintButton = ({ onClick }) => (
  <button className="scroll-hint-btn" onClick={onClick} aria-label="Scroll for more">
    <ChevronDown size={18} />
  </button>
);

export default ScrollHintButton;
