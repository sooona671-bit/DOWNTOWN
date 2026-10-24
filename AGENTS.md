<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## App preservation
- Keep screenshot layout analysis isolated in the Profile checker with authenticated server functions and ephemeral image input; this avoids exposing AI credentials or changing food-ordering authentication and storage.
- Use request-local AI Gateway Responses helpers and strict report schemas for screenshot analysis; this preserves image input fidelity and distinguishes visual findings from real-device verification.
- Persist feature-wide provider denials in a service-only safety table checked before AI requests; this prevents replaying blocked work across page reloads and process restarts.
- Keep the uploaded food-ordering implementation in `src/downtown`, mounted through the TanStack index route with a lazy ClientOnly boundary; this preserves existing browser storage, screens and data flows without SSR side effects.
- Keep original asset paths resolved through a centralized CDN asset map; this preserves all uploaded imagery without placing media binaries in source control.
- Define mobile viewport, dock and photo-control geometry once in the global stylesheet, using a width-based phone breakpoint; this prevents conflicting overrides and preserves tablet/desktop framing.
- Use one mobile viewport scroll container for the header, filters and screen, with the fixed dock outside it; this lets content scroll beneath the status area without moving navigation, while display:contents preserves desktop containment.
- Own mobile containment in ScreenFrame with 100dvh full-height roots, an absolute single scrollport and a viewport-fixed dock; this separates scroll sizing from navigation sizing and preserves desktop framing.
