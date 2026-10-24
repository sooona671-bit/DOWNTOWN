import { forwardRef } from 'react';

// The frame owns viewport containment; screen contents own only their internal layout.
export function ScreenFrame({ hasDock, children }) {
  return <div className="app-shell ambient-background">
    <div className="ambient-orb orb-one" /><div className="ambient-orb orb-two" />
    <main className={`phone-canvas ${hasDock ? 'has-dock' : ''}`}>{children}</main>
  </div>;
}

export const ViewportScroll = forwardRef(function ViewportScroll({ children, onScroll }, ref) {
  return <div className="viewport-scroll" ref={ref} onScroll={onScroll}>{children}</div>;
});

export function AppHeader({ children }) {
  return <header className="app-header">{children}</header>;
}