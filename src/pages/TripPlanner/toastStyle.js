import { colors } from '../../styles/tokens.js';

/**
 * Shared sonner toast styling for the Trip Planner flow. sonner's `style`
 * prop is a plain inline-style object rather than a className, so — like
 * lucide-react icon `color`/`fill` props — it needs the JS token mirror
 * (tokens.js) instead of tokens.css's custom properties.
 */
export const toastStyle = {
  background: colors.white,
  color: colors.blueDeep,
  border: `1.5px solid ${colors.blue}`,
  fontWeight: 600,
  borderRadius: '8px',
};
