$ErrorActionPreference = "Stop"

$repo = "BBuisson188/ATL-Empire"
$branch = "main"
$gh = Join-Path $env:ProgramFiles "GitHub CLI\gh.exe"
if (-not (Test-Path -LiteralPath $gh)) {
  $gh = "gh"
}

$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-JsonFile($Path, $Value, $Depth = 5) {
  $json = $Value | ConvertTo-Json -Depth $Depth -Compress
  [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $Path).Path, $json, $script:utf8NoBom)
}

function Invoke-GhJson {
  param(
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )
  $output = & $script:gh @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "gh failed: $($Arguments -join ' ')`n$output"
  }
  return $output | ConvertFrom-Json
}

function Invoke-Gh {
  param(
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )
  $output = & $script:gh @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "gh failed: $($Arguments -join ' ')`n$output"
  }
  return $output
}

$paths = @(
  "app.js",
  "HANDOFF.md",
  "index.html",
  "publish-gh-api.ps1",
  "styles.css",
  "raise-cash-hotfix.js",
  "assets/mansion.png",
  "assets/townhouse_1.png",
  "assets/townhouse_2.png",
  "assets/townhouse_3.png",
  "assets/townhouse_4.png",
  "assets/board/atlanta-beltline.png",
  "assets/board/path400.png",
  "assets/board/silver-comet-trail.png",
  "assets/board/stone-mountain-trail.png",
  "assets/board/world-of-coca-cola.png"
)

$ref = Invoke-GhJson @("api", "repos/$repo/git/ref/heads/$branch")
$parentSha = $ref.object.sha
$parent = Invoke-GhJson @("api", "repos/$repo/git/commits/$parentSha")
$baseTreeSha = $parent.tree.sha

$tree = @()
foreach ($path in $paths) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing publish file: $path"
  }

  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $path).Path)
  $payload = @{
    content = [System.Convert]::ToBase64String($bytes)
    encoding = "base64"
  }
  $blobInput = New-TemporaryFile
  Write-JsonFile $blobInput $payload
  try {
    $blob = Invoke-GhJson @("api", "-X", "POST", "repos/$repo/git/blobs", "--input", $blobInput)
  } finally {
    Remove-Item -LiteralPath $blobInput -Force
  }

  $tree += @{
    path = $path.Replace("\", "/")
    mode = "100644"
    type = "blob"
    sha = $blob.sha
  }
}

$treeInput = New-TemporaryFile
@{
  base_tree = $baseTreeSha
  tree = $tree
} | ForEach-Object { Write-JsonFile $treeInput $_ 5 }
try {
  $newTree = Invoke-GhJson @("api", "-X", "POST", "repos/$repo/git/trees", "--input", $treeInput)
} finally {
  Remove-Item -LiteralPath $treeInput -Force
}

$commitInput = New-TemporaryFile
@{
  message = "Restore rush hour square visuals and build 2026.05.05b"
  tree = $newTree.sha
  parents = @($parentSha)
} | ForEach-Object { Write-JsonFile $commitInput $_ 5 }
try {
  $commit = Invoke-GhJson @("api", "-X", "POST", "repos/$repo/git/commits", "--input", $commitInput)
} finally {
  Remove-Item -LiteralPath $commitInput -Force
}

$updateInput = New-TemporaryFile
@{
  sha = $commit.sha
  force = $false
} | ForEach-Object { Write-JsonFile $updateInput $_ }
try {
  Invoke-Gh @("api", "-X", "PATCH", "repos/$repo/git/refs/heads/$branch", "--input", $updateInput) | Out-Null
} finally {
  Remove-Item -LiteralPath $updateInput -Force
}

Write-Host "Published $($commit.sha) to $repo $branch"
Write-Host "https://github.com/$repo/commit/$($commit.sha)"
