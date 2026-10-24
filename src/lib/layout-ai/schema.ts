import { z } from 'zod';

export const layoutReportSchema = z.object({
  verdict: z.enum(['issues_found', 'no_visible_issues', 'inconclusive']),
  summary: z.string(),
  findings: z.array(z.object({
    area: z.enum(['top_edge', 'bottom_edge', 'side_edges', 'safe_area', 'status_bar', 'content']),
    severity: z.enum(['high', 'medium', 'low', 'uncertain']),
    observation: z.string(),
    recommendation: z.string(),
  })),
  limitations: z.array(z.string()),
});
export type LayoutReport = z.infer<typeof layoutReportSchema>;

export const screenshotInputSchema = z.object({
  images: z.array(z.object({
    dataUrl: z.string().max(8_000_000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/),
    name: z.string().max(180),
  })).min(1).max(3),
  device: z.enum(['iPhone', 'Android', 'Unknown']),
  mode: z.enum(['Installed app', 'Browser', 'Unknown']),
});