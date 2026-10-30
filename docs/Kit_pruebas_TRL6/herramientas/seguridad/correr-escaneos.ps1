# Escaneos de seguridad automáticos (C5: S9 a S12) para Windows PowerShell. Requiere Docker Desktop.
# Uso:
#   $env:BASE_URL="https://app.ejemplo.com"; $env:DOMINIO="app.ejemplo.com"; $env:EVID="..\..\evidencia\05_seguridad"
#   $env:REPOS="C:\ruta\repo-web;C:\ruta\repo-api"
#   $env:ZAP_HEADER="Cookie"; $env:ZAP_VALOR="session=..."; $env:ZAP_ROL="operador"   # opcional
#   powershell -ExecutionPolicy Bypass -File correr-escaneos.ps1
if (-not $env:BASE_URL -or -not $env:DOMINIO) { throw "Faltan BASE_URL o DOMINIO" }
$EVID = if ($env:EVID) { $env:EVID } else { "..\..\evidencia\05_seguridad" }
New-Item -ItemType Directory -Force -Path $EVID | Out-Null
$EVID = (Resolve-Path $EVID).Path
Write-Host "== S9 cabeceras"; curl.exe -sI $env:BASE_URL | Out-File "$EVID\cabeceras_app.txt" -Encoding utf8
if ($env:API_URL) { curl.exe -sI $env:API_URL | Out-File "$EVID\cabeceras_api.txt" -Encoding utf8 }
Write-Host "== ZAP base"
docker run --rm -v "${EVID}:/zap/wrk" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t $env:BASE_URL -r zap_base.html -J zap_base.json
if ($env:ZAP_VALOR) {
  $rol = if ($env:ZAP_ROL) { $env:ZAP_ROL } else { "rol" }; $cab = if ($env:ZAP_HEADER) { $env:ZAP_HEADER } else { "Cookie" }
  Write-Host "== ZAP autenticado ($rol)"
  docker run --rm -v "${EVID}:/zap/wrk" -e ZAP_AUTH_HEADER=$cab -e ZAP_AUTH_HEADER_VALUE=$env:ZAP_VALOR ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t $env:BASE_URL -r "zap_$rol.html" -J "zap_$rol.json" -m 10
}
Write-Host "== S10 TLS"
docker run --rm drwetter/testssl.sh --quiet --color 0 $env:DOMINIO | Out-File "$EVID\tls.txt" -Encoding utf8
foreach ($repo in ($env:REPOS -split ';' | Where-Object { $_ })) {
  $nombre = Split-Path $repo -Leaf
  Write-Host "== S11 dependencias: $nombre"
  if (Test-Path "$repo\package.json") { Push-Location $repo; npm audit --omit=dev --json | Out-File "$EVID\npm_audit_$nombre.json" -Encoding utf8; Pop-Location }
  Write-Host "== S12 secretos: $nombre"
  docker run --rm -v "${repo}:/repo" -v "${EVID}:/out" zricethezav/gitleaks:latest detect -s /repo --report-format json --report-path "/out/gitleaks_$nombre.json"
}
Write-Host "Listo. Revise $EVID y llene RESULTADOS_S1-S15.md. Cierre la sesion usada para ZAP o rote la clave de prueba."
