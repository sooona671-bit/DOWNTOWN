import { describe, expect, it } from 'vitest';
import { layoutReportSchema, screenshotInputSchema } from '@/lib/layout-ai/schema';

describe('Screenshot checker validation', () => {
  it('accepts supported inline images and rejects remote or excessive uploads', () => {
    const input = { images: [{ name: 'phone.png', dataUrl: 'data:image/png;base64,aGVsbG8=' }], device: 'iPhone', mode: 'Installed app' };
    expect(screenshotInputSchema.safeParse(input).success).toBe(true);
    expect(screenshotInputSchema.safeParse({ ...input, images: [{ name: 'phone', dataUrl: 'https://example.com/phone.png' }] }).success).toBe(false);
    expect(screenshotInputSchema.safeParse({ ...input, images: Array(4).fill(input.images[0]) }).success).toBe(false);
  });
  it('requires a verdict, findings and uncertainty context', () => {
    expect(layoutReportSchema.safeParse({ verdict: 'inconclusive', summary: 'Missing screen edges.', findings: [], limitations: ['Cannot verify scrolling.'] }).success).toBe(true);
    expect(layoutReportSchema.safeParse({ summary: 'Everything works.' }).success).toBe(false);
  });
});