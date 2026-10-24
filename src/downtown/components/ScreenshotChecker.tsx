import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Upload, X, ScanLine, AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { analyzeScreenshots } from '@/lib/layout-ai/analyze.functions';
import type { LayoutReport } from '@/lib/layout-ai/schema';

type Screenshot = { name: string; dataUrl: string };
export default function ScreenshotChecker() {
  const [images, setImages] = useState<Screenshot[]>([]);
  const [device, setDevice] = useState<'iPhone' | 'Android' | 'Unknown'>('Unknown');
  const [mode, setMode] = useState<'Installed app' | 'Browser' | 'Unknown'>('Unknown');
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<LayoutReport | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeScreenshots);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSignedIn(Boolean(data.session)); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { if (active) setSignedIn(Boolean(session)); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  const addImages = async (files: FileList | null) => {
    if (!files) return;
    setError(''); setReport(null);
    if (files.length + images.length > 3) { setError('Choose up to three screenshots.'); return; }
    try {
      const selected = await Promise.all(Array.from(files).map(async (file) => {
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Choose PNG, JPEG or WebP screenshots.');
        if (file.size > 5_000_000) throw new Error('Each screenshot must be smaller than 5 MB.');
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read screenshot.'));
          reader.onerror = () => reject(new Error('Could not read screenshot.'));
          reader.readAsDataURL(file);
        });
        const image = new Image(); image.src = dataUrl;
        await image.decode().catch(() => { throw new Error('This screenshot could not be opened.'); });
        return { name: file.name.slice(0, 180), dataUrl };
      }));
      setImages((current) => [...current, ...selected]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open screenshots.'); }
    finally { if (input.current) input.current.value = ''; }
  };
  const run = async () => {
    if (busy || !images.length || !signedIn) return;
    setBusy(true); setError(''); setReport(null);
    try { const result = await analyze({ data: { images, device, mode } }); setReport(result.report); setError(result.error || ''); }
    catch { setError('The check could not complete. Please confirm you are signed in and connected.'); }
    finally { setBusy(false); }
  };
  const signIn = async () => {
    setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('lovable', { redirect_uri: window.location.origin });
      if (result.error) setError(result.error.message || 'Sign-in could not complete.');
    } catch { setError('Sign-in could not complete.'); }
  };
  return <div className="layout-checker">
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden aria-label="Phone screenshots" onChange={(e) => void addImages(e.target.files)} disabled={busy} />
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" disabled={busy || images.length >= 3} onClick={() => input.current?.click()}><Upload />Upload screenshots</Button>
      <span className="text-xs text-muted-foreground">{images.length}/3 · PNG, JPEG, WebP · 5 MB each</span>
    </div>
    {!!images.length && <div className="grid grid-cols-3 gap-2" aria-label="Selected screenshots">{images.map((image, index) => <figure className="m-0 min-w-0" key={`${index}-${image.name}`}>
      <img className="aspect-[9/19] w-full rounded-md border border-border object-contain bg-muted" src={image.dataUrl} alt={`Screenshot ${index + 1}`} />
      <div className="flex items-center justify-between gap-1"><span className="truncate text-xs">{image.name}</span><Button size="icon" variant="ghost" title="Remove screenshot" aria-label={`Remove screenshot ${index + 1}`} disabled={busy} onClick={() => { setImages(images.filter((_, i) => i !== index)); setReport(null); }}><X /></Button></div>
    </figure>)}</div>}
    <div className="grid grid-cols-2 gap-3">
      <label className="text-xs font-medium">Phone<select className="mt-1 w-full rounded-md border border-border bg-background p-2" disabled={busy} value={device} onChange={(e) => { setDevice(e.target.value as typeof device); setReport(null); }}><option>Unknown</option><option>iPhone</option><option>Android</option></select></label>
      <label className="text-xs font-medium">Opened as<select className="mt-1 w-full rounded-md border border-border bg-background p-2" disabled={busy} value={mode} onChange={(e) => { setMode(e.target.value as typeof mode); setReport(null); }}><option>Unknown</option><option>Installed app</option><option>Browser</option></select></label>
    </div>
    <p className="text-xs text-muted-foreground">Screenshots are sent to Lovable AI only when you run a check and aren’t saved by DOWNTOWN. Hide personal information before uploading. AI checks may incur usage charges.</p>
    {ready && !signedIn ? <Button onClick={() => void signIn()}><ScanLine />Sign in to check screenshots</Button> : <Button disabled={!ready || busy || !images.length} onClick={() => void run()}>{busy ? <LoaderCircle className="animate-spin" /> : <ScanLine />}{busy ? 'Checking screenshots…' : 'Check layout'}</Button>}
    <div aria-live="polite">{error && <p className="text-sm text-foreground" role="alert"><AlertTriangle className="mr-1 inline size-4" />{error}</p>}
      {report && <section className="mt-4 space-y-3" aria-label="Layout report">
        <h2 className="m-0 text-base font-bold">{report.verdict === 'issues_found' ? 'Visible issues found' : report.verdict === 'no_visible_issues' ? 'No visible edge issues' : 'More evidence needed'}</h2>
        <p className="text-sm">{report.summary}</p>
        {report.findings.map((finding, index) => <article className="rounded-md border border-border bg-muted p-3" key={index}><div className="flex items-center justify-between gap-2 text-xs font-bold"><span>{finding.area.replaceAll('_', ' ')}</span><span>{finding.severity}</span></div><p className="text-sm">{finding.observation}</p><p className="text-xs text-muted-foreground">{finding.recommendation}</p></article>)}
        {!report.findings.length && <CheckCircle2 className="size-5 text-primary" />}
        <h3 className="text-sm font-bold">What this cannot confirm</h3><ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{report.limitations.map((item, index) => <li key={index}>{item}</li>)}<li>Screenshots cannot prove live scrolling or fixed navigation on a physical phone.</li></ul>
      </section>}
    </div>
  </div>;
}