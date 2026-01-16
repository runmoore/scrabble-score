## Summary

<!-- Brief description of what changed and why -->

## Visual Changes

<!-- For UI changes, include before/after screenshots using the table format below -->
<!-- IMPORTANT: Restart dev server when switching branches - browser cache is not sufficient -->

<details>
<summary>Before & After Comparison (click to expand)</summary>

<table>
<tr>
<th>Before</th>
<th>After</th>
</tr>
<tr>
<td width="50%">

**Mobile (375px)**

<img src="https://github.com/USER/REPO/blob/main/docs/screenshots/###-feature/before-375px.png?raw=true" width="100%" alt="Before - Mobile 375px"/>

</td>
<td width="50%">

**Mobile (375px)**

<img src="https://github.com/USER/REPO/blob/main/docs/screenshots/###-feature/after-375px.png?raw=true" width="100%" alt="After - Mobile 375px"/>

</td>
</tr>
<tr>
<td width="50%">

**Tablet (768px)**

<img src="https://github.com/USER/REPO/blob/main/docs/screenshots/###-feature/before-768px.png?raw=true" width="100%" alt="Before - Tablet 768px"/>

</td>
<td width="50%">

**Tablet (768px)**

<img src="https://github.com/USER/REPO/blob/main/docs/screenshots/###-feature/after-768px.png?raw=true" width="100%" alt="After - Tablet 768px"/>

</td>
</tr>
<tr>
<td width="50%">

**Desktop (1920px)**

<img src="https://github.com/USER/REPO/blob/main/docs/screenshots/###-feature/before-1920px.png?raw=true" width="100%" alt="Before - Desktop 1920px"/>

</td>
<td width="50%">

**Desktop (1920px)**

<img src="https://github.com/USER/REPO/blob/main/docs/screenshots/###-feature/after-1920px.png?raw=true" width="100%" alt="After - Desktop 1920px"/>

</td>
</tr>
</table>

</details>

## Key Improvements

- <!-- Bullet points highlighting main benefits -->
- <!-- Technical improvements -->
- <!-- Bug fixes -->

## Technical Details

- <!-- Implementation approach -->
- <!-- Key decisions -->
- <!-- Trade-offs considered -->

## Test Results

- [ ] All E2E tests passing (X/X)
- [ ] Manual testing completed on mobile (375px)
- [ ] Manual testing completed on desktop
- [ ] Code quality checks: `npm run lint && npm run typecheck && npm run format`
- [ ] Specific functionality verified (list below)

<!--
Screenshot best practices:
- Kill and restart dev server when switching branches (lsof -ti:3000 | xargs kill -9)
- Capture at multiple viewports: 375px (mobile), 768px (tablet), 1920px (desktop)
- Save screenshots to: docs/screenshots/###-feature-name/
  - Format: before-375px.png, after-375px.png, before-768px.png, etc.
- Commit screenshots to feature branch

Screenshot Persistence for Automation:
To ensure screenshots persist after branch deletion and enable automated PR creation:

1. Store screenshots in docs/screenshots/ directory (committed to repo)
2. Reference screenshots from main branch in PR template using this pattern:
   https://github.com/USER/REPO/blob/main/docs/screenshots/###-feature/screenshot-after-375px.png?raw=true
3. When PR is merged, screenshots automatically become available via main branch URLs
4. This enables AI agents (Claude Code, etc.) to fully automate PR creation via gh CLI

Note: This increases repo size, but is necessary for automation and permanent documentation.
-->

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
