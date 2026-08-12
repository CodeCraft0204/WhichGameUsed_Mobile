# Mobile app assets → Supabase Storage

Static hub / photo-editor / GIF / education PDF assets load from the public bucket **`mobile-app-assets`** instead of the native bundle. Only paths referenced by `remoteAsset()` / `remoteAssetUri()` are uploaded.

## Local keep (still bundled)

- `assets/Splash.png`
- `assets/fonts/**`
- `assets/camera/**` (used chrome icons)

## One-time setup

1. **Apply migration** (Web):

   `supabase/migrations/20260811120000_mobile_app_assets_bucket.sql`

2. **Audit** (optional):

   ```bash
   cd Codebase/Mobile/App
   npm run assets:audit
   ```

3. **Upload used files** (needs service role; do not commit the key).  
   Node 20: the upload script uses the `ws` package (already a devDependency).

   ```bash
   # PowerShell example
   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   # URL can come from App/.env EXPO_PUBLIC_SUPABASE_URL
   npm run assets:upload
   ```

   Dry run: `npm run assets:upload:dry`

4. **Prune local copies**:

   ```bash
   npm run assets:prune                          # unused only (~65 MB)
   npm run assets:prune -- --delete-remote-sources   # after successful upload
   ```

5. Restart Metro with cache clear: `npm run start:clear`

## Adding a new remote asset

1. Place the file under `assets/...` (any path).
2. Reference it with `remoteAsset('relative/path.png')` from `@/constants/remoteAssets`.
3. Run `npm run assets:upload`.
4. Run `npm run assets:prune -- --delete-remote-sources` (optional).

## Photo editor backgrounds

`npm run gen:backgrounds` regenerates `constants/photoEditorBackgrounds/` from files in `assets/Photo Editor/background/` using `remoteAsset(...)`.

## App helper

[`constants/remoteAssets.ts`](../constants/remoteAssets.ts) builds:

`{SUPABASE_URL}/storage/v1/object/public/mobile-app-assets/{encoded-path}`
