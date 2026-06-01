$ErrorActionPreference = 'Stop'
$base = Join-Path (Join-Path (Join-Path $PSScriptRoot '..') 'assets') 'figma'

function Save-FigmaAsset($folder, $name, $url) {
  $dir = Join-Path $base $folder
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $out = Join-Path $dir "$name.png"
  Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
  Write-Host "Saved $folder/$name.png"
}

# Education
@{
  hero_illustration = 'https://www.figma.com/api/mcp/asset/65c65d6e-0721-4582-8798-2b5eab3e158a'
  guide_fake_patches = 'https://www.figma.com/api/mcp/asset/19b09326-5d7e-40e7-86ba-1bb8083c159c'
  guide_beckett = 'https://www.figma.com/api/mcp/asset/55a37dd3-0681-4975-a2bd-91fd8eac954f'
  guide_hobby_history = 'https://www.figma.com/api/mcp/asset/fba817b6-fd6a-408c-8692-39daa641e9e1'
  pdf_icon = 'https://www.figma.com/api/mcp/asset/6510d8a1-0fa1-4d19-9bf3-d47d6ee7dc32'
  video_thumb_ebay = 'https://www.figma.com/api/mcp/asset/1976871b-c817-499f-96d8-c41cfbd621d8'
  video_thumb_beckett = 'https://www.figma.com/api/mcp/asset/32296744-c436-4990-97ef-f8611c03c869'
  video_thumb_patch = 'https://www.figma.com/api/mcp/asset/a1c42636-9cac-4e9a-9d9f-850bd0f350f2'
  play_button = 'https://www.figma.com/api/mcp/asset/0254f2a1-a4b8-43e5-9674-626bb355effc'
  cta_shield = 'https://www.figma.com/api/mcp/asset/a5761386-b1f8-4813-953c-d5f1e89e89af'
  cta_arrow = 'https://www.figma.com/api/mcp/asset/2d5f4b9a-47ec-4062-9829-027cc751c68e'
  menu_dots = 'https://www.figma.com/api/mcp/asset/f513420e-090b-4c07-8eed-824c707dd613'
}.GetEnumerator() | ForEach-Object { Save-FigmaAsset 'education' $_.Key $_.Value }

# Leaderboard
@{
  hero_trophy = 'https://www.figma.com/api/mcp/asset/7b9096b2-4b88-41b9-b626-7ff8e52e24ad'
  cta_trophy = 'https://www.figma.com/api/mcp/asset/63e8ed47-c384-44d1-aeea-3f9ebaed6e85'
  cta_arrow = 'https://www.figma.com/api/mcp/asset/36f71d72-8fd5-4e48-aa7a-36002790697c'
  avatar_rank1 = 'https://www.figma.com/api/mcp/asset/cc8adb5f-6450-45e2-ad08-799478dc2dc8'
  avatar_rank2 = 'https://www.figma.com/api/mcp/asset/05d98f17-02af-4827-954f-9d0c60d97a21'
  avatar_rank3 = 'https://www.figma.com/api/mcp/asset/39cb7d67-c0cd-48aa-af37-9df362813b29'
  avatar_rank4 = 'https://www.figma.com/api/mcp/asset/6ef5a08c-038d-4e9c-92a3-7168a5a3fd10'
  avatar_rank5 = 'https://www.figma.com/api/mcp/asset/ac35b08f-58de-41d5-be91-9f74fafc9321'
  rank_badge1 = 'https://www.figma.com/api/mcp/asset/9967c608-ad34-41a5-8242-ea54d0a0b09d'
  section_chevron = 'https://www.figma.com/api/mcp/asset/c903b69e-9d7d-4858-9eb5-39baf4a8a253'
}.GetEnumerator() | ForEach-Object { Save-FigmaAsset 'leaderboard' $_.Key $_.Value }

# Database (node 1:251 — asset URLs from Figma MCP design context)
@{
  hero_archive = 'https://www.figma.com/api/mcp/asset/f08e04cc-7f8b-44ec-91e9-7f8186986520'
  record_mantle = 'https://www.figma.com/api/mcp/asset/351907ef-0f3a-402b-9096-22ccfc7f20a7'
  record_jordan = 'https://www.figma.com/api/mcp/asset/452d621b-47a1-45e9-81a8-4265e021a7af'
  record_ruth = 'https://www.figma.com/api/mcp/asset/46ed1a68-f827-4de5-86a7-e69510a44d97'
  recent_kobe = 'https://www.figma.com/api/mcp/asset/aa7da043-0191-45ae-ad0d-f9bd333e371a'
  recent_gehrig = 'https://www.figma.com/api/mcp/asset/fbeb40fd-f18d-4fe2-a17d-a10ea0c1f454'
  meta_person = 'https://www.figma.com/api/mcp/asset/661501a5-4d26-4237-938b-575606bb0376'
  meta_baseball = 'https://www.figma.com/api/mcp/asset/7442e9ad-c52d-4daa-9627-4efb9fa8394c'
  meta_basketball = 'https://www.figma.com/api/mcp/asset/c532c248-b6d3-4228-bbd1-9f05f5f04ea9'
  meta_calendar = 'https://www.figma.com/api/mcp/asset/c5e273de-61cd-4f76-a3b1-96c84448ab01'
  meta_shield = 'https://www.figma.com/api/mcp/asset/499ce7fa-02f6-4626-837a-3ccd49c4766b'
  card_chevron = 'https://www.figma.com/api/mcp/asset/27850346-353b-466f-a235-d861466532f1'
  section_chevron = 'https://www.figma.com/api/mcp/asset/d1ad9afb-a4a3-4437-b597-fa539b2de443'
  cta_records = 'https://www.figma.com/api/mcp/asset/b410b784-97c3-440f-bfd9-f156ee3de0c3'
  cta_arrow = 'https://www.figma.com/api/mcp/asset/33655cff-0bb0-4aa5-babe-30189e1a6094'
  nav_database = 'https://www.figma.com/api/mcp/asset/2e0fe746-9267-434a-b129-553fdda077c9'
  nav_authenticate = 'https://www.figma.com/api/mcp/asset/b4d7a7aa-aa5b-4d0e-9ada-4f50ae09a187'
  nav_create = 'https://www.figma.com/api/mcp/asset/bdf08651-0043-476f-a166-1682aa4d1935'
  nav_discussion = 'https://www.figma.com/api/mcp/asset/dc45bab4-0c04-4467-9dec-6fb97f079d07'
  nav_more = 'https://www.figma.com/api/mcp/asset/1767b6c9-431c-4d7d-ac8f-30df616c03a4'
}.GetEnumerator() | ForEach-Object { Save-FigmaAsset 'database' $_.Key $_.Value }

# Authenticate (node 1:96) — add MCP URLs when rate limit resets
# hero, scan_button, cta_icon, cta_arrow, chevron already in assets/figma/authenticate/

Write-Host 'Done.'
