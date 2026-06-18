#!/bin/sh
set -e

CERT_DIR="/tmp/mtls"
mkdir -p "$CERT_DIR"

write_pem_if_set() {
	var_name="$1"
	dest="$2"
	eval "content=\${$var_name}"
	if [ -n "$content" ]; then
		printf '%b' "$content" > "$dest"
	fi
}

write_pem_if_set MTLS_CLIENT_CERT "$CERT_DIR/client.pem"
write_pem_if_set MTLS_CLIENT_KEY "$CERT_DIR/client.key"
write_pem_if_set MTLS_CA_CERT "$CERT_DIR/ca.pem"

if [ -z "$API_UPSTREAM" ]; then
	if [ -n "$API_INTERNAL_URL" ]; then
		export API_UPSTREAM="$API_INTERNAL_URL"
	elif [ -n "$API_INTERNAL_HOST" ]; then
		if [ -f "$CERT_DIR/client.pem" ] && [ -f "$CERT_DIR/client.key" ]; then
			export API_UPSTREAM="https://${API_INTERNAL_HOST}:8443"
		else
			api_port="${API_INTERNAL_PORT:-8080}"
			export API_UPSTREAM="http://${API_INTERNAL_HOST}:${api_port}"
		fi
	else
		echo "API_UPSTREAM ou API_INTERNAL_HOST nao configurado." >&2
		exit 1
	fi
fi

if [ -z "$GLOW_PROXY_SECRET" ]; then
	echo "GLOW_PROXY_SECRET obrigatorio para proxy /api." >&2
	exit 1
fi

if [ -f "$CERT_DIR/client.pem" ] && [ -f "$CERT_DIR/client.key" ]; then
	cat > /tmp/Caddyfile.generated <<EOF
{
	admin off
	persist_config off
	auto_https off
	log { format json }
	servers { trusted_proxies static private_ranges 100.0.0.0/8 }
}

:{\$PORT:3000} {
	log { format json }

	header {
		X-Content-Type-Options nosniff
		X-Frame-Options DENY
		Referrer-Policy strict-origin-when-cross-origin
		Permissions-Policy "camera=(), microphone=(), geolocation=()"
		Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' https://sdk.mercadopago.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://www.google.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; frame-src https://www.google.com; frame-ancestors 'none'"
	}

	respond /health 200

	@api path /api*
	handle @api {
		reverse_proxy ${API_UPSTREAM} {
			header_up X-Glow-Proxy-Secret ${GLOW_PROXY_SECRET}
			header_up X-Forwarded-For {remote_host}
			header_up X-Forwarded-Proto {scheme}
			header_up Host {upstream_hostport}
			transport http {
				tls
				tls_client_cert ${CERT_DIR}/client.pem ${CERT_DIR}/client.key
				tls_trusted_ca_certs ${CERT_DIR}/ca.pem
			}
		}
	}

	root * dist
	encode gzip
	file_server
	try_files {path} /index.html
}
EOF
	exec caddy run --config /tmp/Caddyfile.generated --adapter caddyfile
fi

exec caddy run --config Caddyfile --adapter caddyfile
