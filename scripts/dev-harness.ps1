#requires -Version 5.1
<#
  Harness de desarrollo y pruebas para Legión Anime MVP.
  Orquesta la API anime1v-api (server/) y la app Expo (app/) en local.

  Uso:
    powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 setup
    powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 start
    powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 status
    powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 smoke
    powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 smoke -Full
    powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 verify
    powershell -ExecutionPolicy Bypass -File scripts/dev-harness.ps1 stop

  O desde la raíz: npm run harness:start, harness:smoke, harness:verify, ...
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet('help', 'setup', 'start', 'stop', 'restart', 'status', 'smoke', 'verify')]
  [string]$Action = 'help',

  [switch]$Full,
  [switch]$SkipExport
)

$ErrorActionPreference = 'Stop'

try {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {
  # consola sin soporte UTF-8; se continúa
}

$Root = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $Root 'server'
$AppDir = Join-Path $Root 'app'
$HarnessDir = Join-Path $Root '.harness'
$LogsDir = Join-Path $HarnessDir 'logs'
$ApiPort = 3001
$WebPort = 8081
$BaseUrl = "http://localhost:$ApiPort/api/v1/anime"

function Write-Title([string]$Message) {
  Write-Host ''
  Write-Host "== $Message ==" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
  Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
  Write-Host "  [!]  $Message" -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
  Write-Host "  [X]  $Message" -ForegroundColor Red
}

function Get-ApiKey {
  $envFile = Join-Path $ApiDir '.env'
  if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) {
      if ($line -match '^\s*API_KEYS\s*=\s*(.+)$') {
        return ($matches[1].Split(',')[0]).Trim()
      }
    }
  }
  return 'dev-anime1v-key'
}

function Test-PortListening([int]$Port) {
  $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return [bool]$conn
}

function Get-LanIp {
  try {
    $address = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
      Select-Object -First 1
    if ($address) { return $address.IPAddress }
  } catch {
    # ignore
  }
  return '<IP-LAN>'
}

function Ensure-Environment {
  if (-not (Test-Path $ApiDir)) { throw "No existe la carpeta server/ en $Root" }
  if (-not (Test-Path $AppDir)) { throw "No existe la carpeta app/ en $Root" }

  New-Item -ItemType Directory -Force -Path $HarnessDir, $LogsDir | Out-Null

  $apiEnv = Join-Path $ApiDir '.env'
  if (-not (Test-Path $apiEnv)) {
    Write-Warn 'server/.env no existe: creando configuración de desarrollo (puerto 3001, rate limit desactivado)'
    @'
PORT=3001
NODE_ENV=development
API_KEYS=dev-anime1v-key
DISABLE_AUTH=false
DISABLE_RATE_LIMIT=true
DAILY_REQUEST_LIMIT=10000
REQUEST_TIMEOUT_MS=20000
DOWNLOAD_REQUEST_TIMEOUT_MS=120000
DEFAULT_ANIME_DOMAIN=animeav1.com
'@ | Set-Content -Path $apiEnv -Encoding UTF8
  }

  $appEnv = Join-Path $AppDir '.env'
  if (-not (Test-Path $appEnv)) {
    Write-Warn 'app/.env no existe: copiando app/.env.example'
    Copy-Item (Join-Path $AppDir '.env.example') $appEnv
  }

  if (-not (Test-Path (Join-Path $ApiDir 'node_modules'))) {
    throw 'Faltan dependencias de la API. Ejecuta: npm run harness:setup'
  }
  if (-not (Test-Path (Join-Path $AppDir 'node_modules'))) {
    throw 'Faltan dependencias de la app. Ejecuta: npm run harness:setup'
  }
}

function Invoke-Setup {
  Write-Title 'Requisitos'
  Write-Ok ("node " + (node --version))
  Write-Ok ("npm " + (npm --version))

  New-Item -ItemType Directory -Force -Path $HarnessDir, $LogsDir | Out-Null

  if (-not (Test-Path (Join-Path $ApiDir 'node_modules'))) {
    Write-Title 'Instalando dependencias de la API (server/)'
    Push-Location $ApiDir
    try { npm install; if ($LASTEXITCODE -ne 0) { throw 'npm install falló en server/' } } finally { Pop-Location }
  } else {
    Write-Ok 'server/node_modules presente'
  }

  if (-not (Test-Path (Join-Path $AppDir 'node_modules'))) {
    Write-Title 'Instalando dependencias de la app (app/)'
    Push-Location $AppDir
    try { npm install; if ($LASTEXITCODE -ne 0) { throw 'npm install falló en app/' } } finally { Pop-Location }
  } else {
    Write-Ok 'app/node_modules presente'
  }

  Ensure-Environment

  Write-Title 'Listo'
  Write-Ok 'Entorno preparado. Siguiente paso: npm run harness:start'
}

function Wait-ApiReady([int]$TimeoutSeconds = 40) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-RestMethod "http://localhost:$ApiPort/health" -TimeoutSec 5
      if ($response.status -eq 'ok') { return $true }
    } catch {
      # not ready yet
    }
    Start-Sleep -Seconds 2
  }
  return $false
}

function Wait-WebReady([int]$TimeoutSeconds = 300) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest "http://localhost:$WebPort" -UseBasicParsing -TimeoutSec 240
      if ($response.StatusCode -eq 200) { return $true }
    } catch {
      # bundle still building / server not ready
    }
    Start-Sleep -Seconds 3
  }
  return $false
}

function Start-Api {
  if (Test-PortListening $ApiPort) {
    Write-Ok "API ya está corriendo en http://localhost:$ApiPort"
    return
  }
  Write-Title 'Iniciando API anime1v-api'
  $apiOut = Join-Path $LogsDir 'api.log'
  $apiErr = Join-Path $LogsDir 'api.err.log'
  Start-Process -FilePath 'node' -ArgumentList 'src/server.js' -WorkingDirectory $ApiDir `
    -RedirectStandardOutput $apiOut -RedirectStandardError $apiErr -WindowStyle Hidden | Out-Null

  if (-not (Wait-ApiReady 40)) {
    throw "La API no respondió en 40s. Revisa $apiErr"
  }
  Write-Ok "API lista en http://localhost:$ApiPort (logs: $apiOut)"
}

function Start-Web {
  if (Test-PortListening $WebPort) {
    Write-Ok "App web ya está corriendo en http://localhost:$WebPort"
    return
  }
  Write-Title 'Iniciando app web (Expo + Metro)'
  Write-Warn 'La primera compilación del bundle puede tardar 1-3 minutos'
  $webOut = Join-Path $LogsDir 'web.log'
  $webErr = Join-Path $LogsDir 'web.err.log'
  Start-Process -FilePath 'npx.cmd' -ArgumentList 'expo', 'start', '--web', '--port', "$WebPort" -WorkingDirectory $AppDir `
    -RedirectStandardOutput $webOut -RedirectStandardError $webErr -WindowStyle Hidden | Out-Null

  if (-not (Wait-WebReady 300)) {
    throw "La app web no respondió en 300s. Revisa $webErr y $webOut"
  }
  Write-Ok "App web lista en http://localhost:$WebPort"
}

function Invoke-Start {
  Ensure-Environment
  Start-Api
  Start-Web
  $lan = Get-LanIp
  Write-Title 'Servicios arriba'
  Write-Ok "Web local:        http://localhost:$WebPort"
  Write-Ok "API local:        http://localhost:$ApiPort"
  Write-Ok "API emulador:     http://10.0.2.2:$ApiPort"
  Write-Ok "API dispositivo:  http://${lan}:$ApiPort (configúrala en Perfil > Configuración > Conexión con la API)"
  Write-Host "  Logs: $LogsDir"
}

function Invoke-Stop {
  Write-Title 'Deteniendo servicios del harness'
  foreach ($port in @($WebPort, $ApiPort)) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
      $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
      foreach ($processId in $processIds) {
        try {
          Stop-Process -Id $processId -Force -ErrorAction Stop
          Write-Ok "Proceso $processId detenido (puerto $port)"
        } catch {
          Write-Warn "No se pudo detener el proceso $processId del puerto $port"
        }
      }
    } else {
      Write-Ok "Puerto $port libre"
    }
  }
}

function Invoke-Status {
  Write-Title 'Estado de servicios'
  $apiOk = $false
  try {
    $health = Invoke-RestMethod "http://localhost:$ApiPort/health" -TimeoutSec 5
    $apiOk = $health.status -eq 'ok'
    Write-Ok "API  :$ApiPort => $($health.status)"
  } catch {
    Write-Fail "API  :$ApiPort => sin respuesta"
  }

  try {
    $web = Invoke-WebRequest "http://localhost:$WebPort" -UseBasicParsing -TimeoutSec 20
    Write-Ok "Web  :$WebPort => HTTP $($web.StatusCode)"
  } catch {
    Write-Fail "Web  :$WebPort => sin respuesta"
  }

  if ($apiOk) {
    $key = Get-ApiKey
    try {
      $latest = Invoke-RestMethod "$BaseUrl/latest-episodes?limit=5" -Headers @{ 'X-API-Key' = $key } -TimeoutSec 40
      $firstTitle = 'n/d'
      if ($latest.data.results.Count -gt 0) { $firstTitle = $latest.data.results[0].animeTitle }
      Write-Ok "Últimos episodios => $($latest.data.count) (reciente: $firstTitle)"
    } catch {
      Write-Warn "Últimos episodios no disponible: $($_.Exception.Message)"
    }

    try {
      $image = Invoke-WebRequest ($BaseUrl + '/image-proxy?url=' + [uri]::EscapeDataString('https://cdn.animeav1.com/covers/190.jpg')) -UseBasicParsing -TimeoutSec 30
      Write-Ok "Image proxy => HTTP $($image.StatusCode) ($($image.Headers['Content-Type']))"
    } catch {
      Write-Warn "Image proxy no disponible: $($_.Exception.Message)"
    }
  }

  Write-Host "  Logs: $LogsDir"
}

function Invoke-Smoke {
  param([switch]$FullSmoke)

  $key = Get-ApiKey
  $headers = @{ 'X-API-Key' = $key }
  $failures = 0
  $firstUrl = $null
  $searchResults = @()

  Write-Title 'Smoke tests (API real)'

  try {
    $health = Invoke-RestMethod "http://localhost:$ApiPort/health" -TimeoutSec 10
    if ($health.status -ne 'ok') { throw 'status != ok' }
    Write-Ok 'GET /health'
  } catch {
    $failures++
    Write-Fail "GET /health -> $($_.Exception.Message)"
  }

  try {
    $catalog = Invoke-RestMethod "$BaseUrl/catalog?page=1&provider=animeav1" -Headers $headers -TimeoutSec 90
    if ($catalog.data.count -lt 1) { throw 'sin resultados' }
    $firstUrl = $catalog.data.results[0].url
    Write-Ok "GET /catalog => $($catalog.data.count) títulos (ej: $($catalog.data.results[0].title))"
  } catch {
    $failures++
    Write-Fail "GET /catalog -> $($_.Exception.Message)"
  }

  try {
    $search = Invoke-RestMethod ($BaseUrl + '/search?q=naruto&domain=animeav1.com') -Headers $headers -TimeoutSec 90
    $searchResults = @($search.data.results)
    if ($searchResults.Count -lt 1) { throw 'sin resultados' }
    Write-Ok "GET /search => $($search.data.count) resultados (ej: $($searchResults[0].title))"
  } catch {
    $failures++
    Write-Fail "GET /search -> $($_.Exception.Message)"
  }

  $infoUrl = $firstUrl
  if ($searchResults.Count -gt 0) { $infoUrl = $searchResults[0].url }

  $episodes = @()
  if ($infoUrl) {
    try {
      $info = Invoke-RestMethod ($BaseUrl + '/info?url=' + [uri]::EscapeDataString($infoUrl)) -Headers $headers -TimeoutSec 120
      $episodes = @($info.data.episodes)
      if (-not $info.data.title) { throw 'sin título' }
      Write-Ok "GET /info => $($info.data.title) | score: $($info.data.score) | episodios: $($episodes.Count)"
    } catch {
      $failures++
      Write-Fail "GET /info -> $($_.Exception.Message)"
    }
  }

  try {
    $latest = Invoke-RestMethod "$BaseUrl/latest-episodes?limit=30" -Headers $headers -TimeoutSec 90
    if ($latest.data.count -lt 1) { throw 'sin resultados' }
    Write-Ok "GET /latest-episodes => $($latest.data.count) estrenos (ej: $($latest.data.results[0].animeTitle) ep $($latest.data.results[0].number))"
  } catch {
    $failures++
    Write-Fail "GET /latest-episodes -> $($_.Exception.Message)"
  }

  try {
    $image = Invoke-WebRequest ($BaseUrl + '/image-proxy?url=' + [uri]::EscapeDataString('https://cdn.animeav1.com/covers/190.jpg')) -UseBasicParsing -TimeoutSec 40
    if ($image.Headers['Content-Type'] -notlike 'image/*') { throw "content-type inesperado: $($image.Headers['Content-Type'])" }
    Write-Ok "GET /image-proxy => HTTP $($image.StatusCode) ($($image.RawContentLength) bytes)"
  } catch {
    $failures++
    Write-Fail "GET /image-proxy -> $($_.Exception.Message)"
  }

  if ($FullSmoke) {
    if ($episodes.Count -gt 0) {
      try {
        $episodeUrl = $episodes[0].url
        $episode = Invoke-RestMethod ($BaseUrl + '/episode?url=' + [uri]::EscapeDataString($episodeUrl)) -Headers $headers -TimeoutSec 90
        $subLinks = @($episode.data.streamLinks.SUB)
        Write-Ok "GET /episode => SUB=$($episode.data.variants.SUB) DUB=$($episode.data.variants.DUB) (servidores SUB: $($subLinks.Count))"

        if ($subLinks.Count -gt 0) {
          try {
            $resolved = Invoke-RestMethod ($BaseUrl + '/resolve?url=' + [uri]::EscapeDataString($subLinks[0].url)) -Headers $headers -TimeoutSec 120
            $valid = $resolved.streamUrl -match '\.(mp4|m3u8|webm)'
            if (-not $valid) { throw "enlace no reproducible: $($resolved.streamUrl)" }
            Write-Ok "GET /resolve => $($resolved.server) ($($resolved.mediaType))"
          } catch {
            $failures++
            Write-Fail "GET /resolve -> $($_.Exception.Message)"
          }
        }
      } catch {
        $failures++
        Write-Fail "GET /episode -> $($_.Exception.Message)"
      }
    } else {
      $failures++
      Write-Fail 'GET /episode -> sin episodios para probar'
    }
  } else {
    Write-Warn 'Flujo de reproducción omitido (usa -Full para probar /episode y /resolve)'
  }

  Write-Title 'Resultado'
  if ($failures -eq 0) {
    Write-Ok 'Todos los smoke tests pasaron'
  } else {
    Write-Fail "$failures prueba(s) fallaron"
    exit 1
  }
}

function Invoke-Verify {
  param([bool]$RunExport)

  if (-not $RunExport) {
    Write-Warn 'Verificación sin export (usa -SkipExport:$false para incluir el export web)'
  }

  Write-Title 'Typecheck (tsc --noEmit)'
  Push-Location $AppDir
  try {
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript encontró errores' }
    Write-Ok 'TypeScript sin errores'
  } finally {
    Pop-Location
  }

  Write-Title 'Lint (expo lint)'
  $previousCi = $env:CI
  $env:CI = '1'
  Push-Location $AppDir
  try {
    npx expo lint
    if ($LASTEXITCODE -ne 0) { throw 'Lint encontró errores' }
    Write-Ok 'Lint sin errores'
  } finally {
    Pop-Location
    $env:CI = $previousCi
  }

  if ($RunExport) {
    Write-Title 'Export web de producción (expo export)'
    $env:CI = '1'
    Push-Location $AppDir
    try {
      npx expo export --platform web
      if ($LASTEXITCODE -ne 0) { throw 'expo export falló' }
      Write-Ok 'Export web generado en app/dist'
    } finally {
      Pop-Location
      $env:CI = $previousCi
    }
  }

  Invoke-Smoke -FullSmoke:$Full
}

function Invoke-Help {
  Write-Host ''
  Write-Host 'Harness de desarrollo — Legión Anime MVP' -ForegroundColor White
  Write-Host ''
  Write-Host '  setup            Instala dependencias (server/ y app/) y crea los .env de desarrollo'
  Write-Host '  start            Arranca API (:3001) y app web (:8081) con health checks'
  Write-Host '  status           Muestra estado de API, web, últimos episodios e image proxy'
  Write-Host '  smoke            Smoke tests reales de la API (rápido)'
  Write-Host '  smoke -Full      Incluye /episode y /resolve (reproducción real; puede tardar)'
  Write-Host '  verify           tsc + lint + export web + smoke -Full'
  Write-Host '  verify -SkipExport  tsc + lint + smoke -Full (sin export)'
  Write-Host '  stop             Detiene los servicios de los puertos 3001 y 8081'
  Write-Host '  restart          stop + start'
  Write-Host ''
  Write-Host '  Logs: .harness/logs  |  URL LAN para Android físico: usa Get-LanIp en el arranque'
  Write-Host ''
}

try {
  switch ($Action) {
    'setup' { Invoke-Setup }
    'start' { Invoke-Start }
    'stop' { Invoke-Stop }
    'restart' { Invoke-Stop; Invoke-Start }
    'status' { Invoke-Status }
    'smoke' { Ensure-Environment; Invoke-Smoke -FullSmoke:$Full }
    'verify' {
      Ensure-Environment
      Invoke-Verify -RunExport:(-not $SkipExport)
    }
    default { Invoke-Help }
  }
} catch {
  Write-Host ''
  Write-Fail $_.Exception.Message
  exit 1
}
