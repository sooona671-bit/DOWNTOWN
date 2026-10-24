import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppHeader, ScreenFrame, ViewportScroll } from '@/downtown/components/ScreenFrame.jsx';

describe('Mobile screen frame', () => {
  it('keeps header and content in one scrollport and navigation outside it', () => {
    const { container } = render(<ScreenFrame hasDock><ViewportScroll><AppHeader>Header</AppHeader><section className="screen">Content</section></ViewportScroll><nav className="bottom-nav">Navigation</nav></ScreenFrame>);
    const canvas = container.querySelector('.phone-canvas');
    const scroll = container.querySelector('.viewport-scroll');
    expect(canvas?.classList.contains('has-dock')).toBe(true);
    expect(scroll?.querySelector('.app-header')).not.toBeNull();
    expect(scroll?.querySelector('.screen')).not.toBeNull();
    expect(scroll?.querySelector('.bottom-nav')).toBeNull();
    expect(canvas?.querySelector(':scope > .bottom-nav')).not.toBeNull();
  });
});