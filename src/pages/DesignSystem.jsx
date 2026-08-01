import React, { useEffect, useState } from 'react';
import '../styles/tokens.css';
import '../styles/base.css';
import './DesignSystem.css';

/**
 * Live style guide. Every swatch renders via var(--token) and reads its
 * resolved value from the DOM, so this page can never drift from tokens.css
 * — if you change a value there, this page reflects it automatically.
 */

const colorGroups = [
  {
    title: 'Brand',
    tokens: ['--mmt-blue', '--mmt-blue-light', '--mmt-blue-mid', '--mmt-blue-deep', '--mmt-navy', '--mmt-navy-light', '--mmt-red', '--mmt-red-dark'],
  },
  {
    title: 'Surface',
    tokens: ['--mmt-white', '--mmt-bg-page', '--mmt-bg-page-alt', '--mmt-bg-warm', '--mmt-border', '--mmt-border-subtle', '--mmt-border-light', '--mmt-blue-tint', '--mmt-blue-tint-hover'],
  },
  {
    title: 'Text',
    tokens: ['--mmt-text-primary', '--mmt-text-secondary', '--mmt-text-tertiary', '--mmt-text-light', '--mmt-text-white'],
  },
  {
    title: 'Semantic',
    tokens: ['--mmt-success', '--mmt-success-tint', '--mmt-warning', '--mmt-purple', '--mmt-online'],
  },
];

const gradients = [
  '--gradient-btn-primary', '--gradient-hero', '--gradient-tint', '--gradient-price-drop', '--gradient-myra',
];

const typeScale = [
  '--text-2xs', '--text-xs', '--text-sm', '--text-base', '--text-md', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl',
];

const weights = ['--fw-regular', '--fw-medium', '--fw-semibold', '--fw-bold', '--fw-black', '--fw-heavy'];

const spacingScale = [
  '--space-3xs', '--space-2xs', '--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl', '--space-2xl', '--space-3xl', '--space-4xl', '--space-5xl',
];

const radii = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl', '--radius-btn', '--radius-pill'];

const shadows = ['--shadow-xs', '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl', '--shadow-btn-primary', '--shadow-bottom-nav', '--shadow-chatbot'];

const motion = ['--duration-fast', '--duration-base', '--duration-slow', '--ease-standard', '--ease-decelerate', '--ease-spring'];

function useResolvedTokens(tokenNames) {
  const [values, setValues] = useState({});
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const next = {};
    tokenNames.forEach((t) => { next[t] = style.getPropertyValue(t).trim(); });
    setValues(next);
  }, [tokenNames]);
  return values;
}

const Swatch = ({ token, value }) => (
  <div className="ds-swatch">
    <div className="ds-swatch-color" style={{ background: `var(${token})` }} />
    <div className="ds-swatch-meta">
      <code className="ds-token-name">{token}</code>
      <span className="ds-token-value">{value}</span>
    </div>
  </div>
);

const DesignSystem = () => {
  const allTokens = [
    ...colorGroups.flatMap((g) => g.tokens),
    ...gradients, ...typeScale, ...weights, ...spacingScale, ...radii, ...shadows, ...motion,
  ];
  const values = useResolvedTokens(allTokens);

  return (
    <div className="ds-page">
      <header className="ds-hero">
        <span className="ds-eyebrow">MakeMyTrip Clone — Design System</span>
        <h1>Tokens, not guesses.</h1>
        <p>
          Every value below is read live from <code>src/styles/tokens.css</code> — the single source of
          truth every component in this app consumes. When prompting for a new component, point at this
          page instead of re-describing colors and spacing from memory.
        </p>
      </header>

      <section className="ds-section">
        <h2>Color</h2>
        {colorGroups.map((group) => (
          <div key={group.title} className="ds-subgroup">
            <h3>{group.title}</h3>
            <div className="ds-swatch-grid">
              {group.tokens.map((t) => <Swatch key={t} token={t} value={values[t]} />)}
            </div>
          </div>
        ))}
      </section>

      <section className="ds-section">
        <h2>Gradients</h2>
        <div className="ds-gradient-grid">
          {gradients.map((t) => (
            <div key={t} className="ds-gradient-card" style={{ background: `var(${t})` }}>
              <code>{t}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2>Typography</h2>
        <p className="ds-section-note">Family: <code>var(--font-family)</code> — Lato (verified from source)</p>
        <div className="ds-type-list">
          {typeScale.map((t) => (
            <div key={t} className="ds-type-row">
              <span style={{ fontSize: `var(${t})`, fontWeight: 700 }}>Where do you want to go?</span>
              <code>{t} · {values[t]}</code>
            </div>
          ))}
        </div>
        <div className="ds-weight-list">
          {weights.map((t) => (
            <span key={t} className="ds-weight-chip" style={{ fontWeight: `var(${t})` }}>
              {t} ({values[t]})
            </span>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2>Spacing</h2>
        <div className="ds-spacing-list">
          {spacingScale.map((t) => (
            <div key={t} className="ds-spacing-row">
              <div className="ds-spacing-bar" style={{ width: `var(${t})` }} />
              <code>{t} · {values[t]}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2>Radius</h2>
        <div className="ds-radius-grid">
          {radii.map((t) => (
            <div key={t} className="ds-radius-item">
              <div className="ds-radius-box" style={{ borderRadius: `var(${t})` }} />
              <code>{t} · {values[t]}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2>Elevation</h2>
        <div className="ds-shadow-grid">
          {shadows.map((t) => (
            <div key={t} className="ds-shadow-item">
              <div className="ds-shadow-box" style={{ boxShadow: `var(${t})` }} />
              <code>{t}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2>Motion</h2>
        <div className="ds-motion-list">
          {motion.map((t) => (
            <code key={t} className="ds-motion-chip">{t} · {values[t]}</code>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2>Component examples</h2>
        <div className="ds-example-row">
          <button className="ds-example-btn-primary">Primary action</button>
          <button className="ds-example-btn-secondary">Secondary action</button>
          <span className="ds-example-chip">Filter chip</span>
          <span className="ds-example-badge">new</span>
        </div>
        <div className="ds-example-card">
          <div className="ds-example-avatar" />
          <div>
            <p className="ds-example-card-title">Card title</p>
            <p className="ds-example-card-sub">Secondary supporting text uses --mmt-text-tertiary.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
