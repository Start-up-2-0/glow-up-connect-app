#!/bin/sh
set -e

CERT_DIR="/tmp/mtls"
CADDY_CONFIG="/tmp/Caddyfile.generated"
mkdir -p "$CERT_DIR"

MTLS_SERVER_NAME="${MTLS_SERVER_NAME:-glowapi.internal}"
MTLS_UPSTREAM_PORT="${MTLS_UPSTREAM_PORT:-${MTLS_MUTUAL_TLS_PORT:-8443}}"

write_pem_if_set() {
	var_name="$1"
	dest="$2"
	content=$(printenv "$var_name" 2>/dev/null || true)
	if [ -z "$content" ]; then
		return 1
	fi

	printf '%b' "$content" > "$dest"
	if ! grep -q 'BEGIN' "$dest"; then
		echo "caddy: PEM invalido em ${var_name} (esperado -----BEGIN ...-----)." >&2
		return 1
	fi
	chmod 600 "$dest"
	return 0
}

extract_host_from_url() {
	printf '%s' "$1" | sed -e 's|^[a-zA-Z]*://||' -e 's|/.*||' -e 's|:.*||'
}

extract_port_from_url() {
	printf '%s' "$1" | sed -n 's|^[a-zA-Z]*://[^:]*:\([0-9][0-9]*\).*|\1|p'
}

resolve_internal_host() {
	host="${API_INTERNAL_HOST:-}"

	if [ -z "$host" ] && [ -n "${API_INTERNAL_URL:-}" ]; then
		host=$(extract_host_from_url "$API_INTERNAL_URL")
	fi

	if [ -z "$host" ] && [ -n "${API_UPSTREAM:-}" ]; then
		host=$(extract_host_from_url "$API_UPSTREAM")
	fi

	printf '%s' "$host"
}

resolve_mtls_upstream_port() {
	if [ -n "${MTLS_UPSTREAM_PORT:-}" ]; then
		printf '%s' "$MTLS_UPSTREAM_PORT"
		return
	fi

	if [ -n "${API_INTERNAL_URL:-}" ]; then
		port_from_url=$(extract_port_from_url "$API_INTERNAL_URL")
		if [ -n "$port_from_url" ]; then
			printf '%s' "$port_from_url"
			return
		fi
	fi

	if [ -n "${API_UPSTREAM:-}" ]; then
		port_from_url=$(extract_port_from_url "$API_UPSTREAM")
		if [ -n "$port_from_url" ]; then
			printf '%s' "$port_from_url"
			return
		fi
	fi

	printf '%s' "8443"
}

setup_mtls_upstream() {
	internal_host=$(resolve_internal_host)
	internal_port=$(resolve_mtls_upstream_port)

	if [ -z "$internal_host" ]; then
		echo "caddy: API_INTERNAL_HOST ou API_INTERNAL_URL obrigatorio para mTLS." >&2
		exit 1
	fi

	export API_UPSTREAM="https://${internal_host}:${internal_port}"
	echo "caddy: mTLS upstream ${API_UPSTREAM} (SNI=${MTLS_SERVER_NAME}, porta=${internal_port})" >&2
}

setup_http_upstream() {
	internal_host=$(resolve_internal_host)
	internal_port="${API_INTERNAL_PORT:-8080}"

	if [ -n "${API_INTERNAL_URL:-}" ]; then
		port_from_url=$(extract_port_from_url "$API_INTERNAL_URL")
		[ -n "$port_from_url" ] && internal_port="$port_from_url"
	fi

	if [ -n "${API_UPSTREAM:-}" ]; then
		port_from_url=$(extract_port_from_url "$API_UPSTREAM")
		if [ -n "$port_from_url" ] && printf '%s' "$API_UPSTREAM" | grep -q '^http://'; then
			internal_port="$port_from_url"
		fi
	fi

	if [ -z "$internal_host" ]; then
		echo "caddy: API_INTERNAL_HOST ou API_INTERNAL_URL obrigatorio para proxy HTTP interno." >&2
		exit 1
	fi

	export API_UPSTREAM="http://${internal_host}:${internal_port}"
	echo "caddy: HTTP upstream ${API_UPSTREAM} (sem mTLS)" >&2
}

MTLS_MODE=false

if write_pem_if_set MTLS_CLIENT_CERT "$CERT_DIR/client.pem" \
	&& write_pem_if_set MTLS_CLIENT_KEY "$CERT_DIR/client.key"; then
	write_pem_if_set MTLS_CA_CERT "$CERT_DIR/ca.pem" || true
	MTLS_MODE=true
	echo "caddy: certificados cliente mTLS carregados." >&2
elif [ -n "${MTLS_CLIENT_CERT:-}" ] || [ -n "${MTLS_CLIENT_KEY:-}" ]; then
	echo "caddy: MTLS_CLIENT_CERT/KEY definidos mas PEM invalido. Revise as variaveis no Railway." >&2
	exit 1
fi

if [ -z "$GLOW_PROXY_SECRET" ]; then
	echo "GLOW_PROXY_SECRET obrigatorio para proxy /api." >&2
	exit 1
fi

if [ "$MTLS_REQUIRED" = "true" ] || [ "$MTLS_REQUIRED" = "1" ]; then
	if [ "$MTLS_MODE" != "true" ]; then
		echo "caddy: MTLS_REQUIRED=true mas certificados cliente nao foram carregados." >&2
		exit 1
	fi
fi

if [ "$MTLS_MODE" = "true" ]; then
	setup_mtls_upstream
elif [ -z "$API_UPSTREAM" ]; then
	if [ "$MTLS_REQUIRED" = "true" ] || [ "$MTLS_REQUIRED" = "1" ]; then
		echo "caddy: MTLS_REQUIRED=true — proxy HTTP interno nao permitido." >&2
		exit 1
	fi
	setup_http_upstream
elif printf '%s' "$API_UPSTREAM" | grep -q '^https://'; then
	echo "caddy: API_UPSTREAM e HTTPS mas certificados cliente mTLS nao foram carregados." >&2
	echo "caddy: configure MTLS_CLIENT_CERT, MTLS_CLIENT_KEY e MTLS_CA_CERT no servico App." >&2
	exit 1
else
	echo "caddy: usando API_UPSTREAM=${API_UPSTREAM}" >&2
fi

if [ "$MTLS_MODE" = "true" ]; then
	cat > "$CADDY_CONFIG" <<EOF
{
	admin off
	persist_config off
	auto_https off

	log {
		format json
	}

	servers {
		trusted_proxies static private_ranges 100.0.0.0/8
	}
}

:{\$PORT:3000} {
	log {
		format json
	}

	header {
		X-Content-Type-Options nosniff
		X-Frame-Options DENY
		Referrer-Policy strict-origin-when-cross-origin
		Permissions-Policy "camera=(), microphone=(), geolocation=(self)"
		Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' https://sdk.mercadopago.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://www.google.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; frame-src https://www.google.com; frame-ancestors 'none'"
	}

	respond /health 200

	route {
		handle /api* {
			reverse_proxy ${API_UPSTREAM} {
				header_up X-Glow-Proxy-Secret ${GLOW_PROXY_SECRET}
				transport http {
					tls
					tls_server_name ${MTLS_SERVER_NAME}
					tls_client_auth ${CERT_DIR}/client.pem ${CERT_DIR}/client.key
					tls_trust_pool file ${CERT_DIR}/ca.pem
				}
			}
		}

		handle {
			root * dist
			encode gzip
			try_files {path} /index.html
			file_server
		}
	}
}
EOF
else
	cat > "$CADDY_CONFIG" <<EOF
{
	admin off
	persist_config off
	auto_https off

	log {
		format json
	}

	servers {
		trusted_proxies static private_ranges 100.0.0.0/8
	}
}

:{\$PORT:3000} {
	log {
		format json
	}

	header {
		X-Content-Type-Options nosniff
		X-Frame-Options DENY
		Referrer-Policy strict-origin-when-cross-origin
		Permissions-Policy "camera=(), microphone=(), geolocation=(self)"
		Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' https://sdk.mercadopago.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://www.google.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; frame-src https://www.google.com; frame-ancestors 'none'"
	}

	respond /health 200

	route {
		handle /api* {
			reverse_proxy ${API_UPSTREAM} {
				header_up X-Glow-Proxy-Secret ${GLOW_PROXY_SECRET}
			}
		}

		handle {
			root * dist
			encode gzip
			try_files {path} /index.html
			file_server
		}
	}
}
EOF
fi

if ! caddy validate --config "$CADDY_CONFIG" --adapter caddyfile 2>&1; then
	echo "caddy: Caddyfile gerado invalido em ${CADDY_CONFIG}" >&2
	exit 1
fi

echo "caddy: modo=$([ "$MTLS_MODE" = true ] && printf mTLS || printf HTTP) config=${CADDY_CONFIG}" >&2
exec caddy run --config "$CADDY_CONFIG" --adapter caddyfile
