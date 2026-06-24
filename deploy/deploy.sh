#!/usr/bin/env bash
#
# Publica o build estático (dist/) no servidor via SSH e recarrega o nginx.
# Não depende de rsync no servidor — usa apenas `tar` e `ssh` (universais).
#
# Variáveis de ambiente esperadas:
#   SSH_HOST      host/IP do servidor          (obrigatória)
#   SSH_USER      usuário SSH                  (obrigatória)
#   SSH_PORT      porta SSH                    (padrão: 22)
#   DEPLOY_PATH   raiz web servida pelo nginx  (padrão: /var/www/clipsi)
#
# A chave privada deve estar em ~/.ssh/deploy_key (configurada no workflow).

set -euo pipefail

# ---- Cores / logs ----
BLUE='\033[1;34m'; GREEN='\033[1;32m'; RED='\033[1;31m'; RESET='\033[0m'
log() { printf "${BLUE}==> %s${RESET}\n" "$1"; }
ok()  { printf "${GREEN}✔ %s${RESET}\n" "$1"; }
die() { printf "${RED}✗ %s${RESET}\n" "$1" >&2; exit 1; }

# ---- Parâmetros ----
: "${SSH_HOST:?defina SSH_HOST}"
: "${SSH_USER:?defina SSH_USER}"
SSH_PORT="${SSH_PORT:-22}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/clipsi}"

REMOTE="${SSH_USER}@${SSH_HOST}"
SSH=(ssh -i "$HOME/.ssh/deploy_key" -p "$SSH_PORT" -o StrictHostKeyChecking=yes)
NGINX_CONF="clipsi.arthurlunkes.com.br.conf"

[ -d dist ] || die "diretório dist/ não encontrado (rode o build antes)"

# ----------------------------------------------------------------
# 1. Publicar o build (extração em diretório temporário + troca)
# ----------------------------------------------------------------
echo "::group::Publicar build em ${REMOTE}:${DEPLOY_PATH}"
log "Enviando dist/ via tar"

RELEASE="${DEPLOY_PATH}.release"
tar -czf - -C dist . | "${SSH[@]}" "$REMOTE" "
  set -e
  rm -rf '${RELEASE}'
  mkdir -p '${RELEASE}' \"\$(dirname '${DEPLOY_PATH}')\"
  tar -xzf - -C '${RELEASE}'
"

log "Trocando release atual (atômico)"
"${SSH[@]}" "$REMOTE" "
  set -e
  rm -rf '${DEPLOY_PATH}.old'
  [ -d '${DEPLOY_PATH}' ] && mv '${DEPLOY_PATH}' '${DEPLOY_PATH}.old' || true
  mv '${RELEASE}' '${DEPLOY_PATH}'
  rm -rf '${DEPLOY_PATH}.old'
"
ok "Build publicado"
echo "::endgroup::"

# ----------------------------------------------------------------
# 2. Instalar a configuração do nginx (apenas se ainda não existir)
# ----------------------------------------------------------------
echo "::group::Configuração do nginx"
log "Enviando ${NGINX_CONF}"
"${SSH[@]}" "$REMOTE" "cat > /tmp/${NGINX_CONF}" < "deploy/nginx/${NGINX_CONF}"

"${SSH[@]}" "$REMOTE" "
  set -e
  available=/etc/nginx/sites-available/${NGINX_CONF}
  enabled=/etc/nginx/sites-enabled/${NGINX_CONF}
  if [ ! -f \"\$available\" ]; then
    echo 'Config nao encontrada — instalando...'
    sudo install -m 0644 /tmp/${NGINX_CONF} \"\$available\"
    sudo ln -sfn \"\$available\" \"\$enabled\"
    sudo rm -f /etc/nginx/sites-enabled/default
  else
    echo 'Config ja existe — mantendo a versao do servidor.'
  fi
  rm -f /tmp/${NGINX_CONF}
"
ok "Config do nginx garantida"
echo "::endgroup::"

# ----------------------------------------------------------------
# 3. Validar e recarregar o nginx
# ----------------------------------------------------------------
echo "::group::Reload do nginx"
log "nginx -t && systemctl reload nginx"
"${SSH[@]}" "$REMOTE" 'sudo nginx -t && sudo systemctl reload nginx'
ok "nginx recarregado"
echo "::endgroup::"

printf "${GREEN}==> Deploy concluído com sucesso${RESET}\n"
