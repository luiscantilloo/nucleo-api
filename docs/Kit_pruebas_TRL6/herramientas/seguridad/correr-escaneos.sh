#!/usr/bin/env bash
# Escaneos de seguridad automáticos (C5: S9 a S12). Requiere Docker. Guarda todo en la carpeta de evidencia.
# Uso:
#   export BASE_URL=https://app.ejemplo.com  DOMINIO=app.ejemplo.com  EVID=../../evidencia/05_seguridad
#   export REPOS="/ruta/repo-web /ruta/repo-api"          # repositorios locales a revisar
#   export ZAP_HEADER="Cookie" ZAP_VALOR="session=..."     # opcional: sesión de un rol para ZAP autenticado
#   export ZAP_ROL=operador                                # nombre del rol de esa sesión (para el archivo)
#   bash correr-escaneos.sh
set -u
: "${BASE_URL:?Falta BASE_URL}"; : "${DOMINIO:?Falta DOMINIO}"; EVID="${EVID:-../../evidencia/05_seguridad}"
mkdir -p "$EVID"; EVID="$(cd "$EVID" && pwd)"
echo "== S9 cabeceras";  curl -sI "$BASE_URL" > "$EVID/cabeceras_app.txt"; [ -n "${API_URL:-}" ] && curl -sI "$API_URL" > "$EVID/cabeceras_api.txt"
echo "== ZAP base (sin sesión)"
docker run --rm -v "$EVID:/zap/wrk" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t "$BASE_URL" -r zap_base.html -J zap_base.json || true
if [ -n "${ZAP_VALOR:-}" ]; then
  echo "== ZAP autenticado (${ZAP_ROL:-rol})"
  docker run --rm -v "$EVID:/zap/wrk" -e ZAP_AUTH_HEADER="${ZAP_HEADER:-Cookie}" -e ZAP_AUTH_HEADER_VALUE="$ZAP_VALOR" \
    ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t "$BASE_URL" -r "zap_${ZAP_ROL:-rol}.html" -J "zap_${ZAP_ROL:-rol}.json" -m 10 || true
fi
echo "== S10 TLS"
docker run --rm drwetter/testssl.sh --quiet --color 0 "$DOMINIO" > "$EVID/tls.txt" || true
for repo in ${REPOS:-}; do
  nombre="$(basename "$repo")"
  echo "== S11 dependencias: $nombre"
  if [ -f "$repo/package.json" ]; then (cd "$repo" && npm audit --omit=dev --json > "$EVID/npm_audit_$nombre.json") || true; fi
  if [ -f "$repo/requirements.txt" ]; then docker run --rm -v "$repo:/src" python:3.12-slim sh -c "pip install -q pip-audit && pip-audit -r /src/requirements.txt -f json" > "$EVID/pip_audit_$nombre.json" || true; fi
  echo "== S12 secretos: $nombre"
  docker run --rm -v "$repo:/repo" -v "$EVID:/out" zricethezav/gitleaks:latest detect -s /repo --report-format json --report-path "/out/gitleaks_$nombre.json" || true
done
echo "Listo. Revise $EVID y llene RESULTADOS_S1-S15.md. Cierre la sesión usada para ZAP o rote la clave de prueba."
