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

extract_host_from_url() {
	printf '%s' "$1" | sed -e 's|^[a-zA-Z]*://||' -e 's|/.*||' -e 's|:.*||'
}

extract_port_from_url() {
	printf '%s' "$1" | sed -n 's|^[a-zA-Z]*://[^:]*:\([0-9][0-9]*\).*|\1|p'
}

resolve_host_ip() {
	host="$1"
	ip=$(getent ahostsv4 "$host" 2>/dev/null | awk 'NR==1 { print $1 }')
	if [ -z "$ip" ]; then
		ip=$(getent hosts "$host" 2>/dev/null | awk '{ print $1 }')
	fi
	printf '%s' "$ip"
}

setup_mtls_upstream() {
	internal_host="${API_INTERNAL_HOST:-}"
	internal_port="${MTLS_UPSTREAM_PORT:-8443}"

	if [ -z "$internal_host" ] && [ -n "$API_INTERNAL_URL" ]; then
		internal_host=$(extract_host_from_url "$API_INTERNAL_URL")
		port_from_url=$(extract_port_from_url "$API_INTERNAL_URL")
		[ -n "$port_from_url" ] && internal_port="$port_from_url"
	fi

	if [ -z "$internal_host" ] && [ -n "$API_UPSTREAM" ]; then
		internal_host=$(extract_host_from_url "$API_UPSTREAM")
		port_from_url=$(extract_port_from_url "$API_UPSTREAM")
		[ -n "$port_from_url" ] && internal_port="$port_from_url"
	fi

	if [ -z "$internal_host" ]; then
		echo "API_INTERNAL_HOST ou API_INTERNAL_URL obrigatorio para mTLS." >&2
		exit 1
	fi

	ip=$(resolve_host_ip "$internal_host")
	if [ -z "$ip" ]; then
		echo "Nao foi possivel resolver ${internal_host} para mTLS." >&2
		exit 1
	fi

	echo "${ip} ${MTLS_SERVER_NAME}" >> /etc/hosts
	export API_UPSTREAM="https://${MTLS_SERVER_NAME}:${internal_port}"
	echo "mTLS upstream ${API_UPSTREAM} (${internal_host} -> ${ip})" >&2
}

write_pem_if_set MTLS_CLIENT_CERT "$CERT_DIR/client.pem"
write_pem_if_set MTLS_CLIENT_KEY "$CERT_DIR/client.key"
write_pem_if_set MTLS_CA_CERT "$CERT_DIR/ca.pem"

MTLS_SERVER_NAME="${MTLS_SERVER_NAME:-glowapi.internal}"

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
	setup_mtls_upstream

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

	route {
		handle /api* {
			reverse_proxy ${API_UPSTREAM} {
				header_up X-Glow-Proxy-Secret ${GLOW_PROXY_SECRET}
				transport http {
					tls
					tls_server_name ${MTLS_SERVER_NAME}
					tls_client_cert ${CERT_DIR}/client.pem ${CERT_DIR}/client.key
					tls_trusted_ca_certs ${CERT_DIR}/ca.pem
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
	exec caddy run --config /tmp/Caddyfile.generated --adapter caddyfile
fi

exec caddy run --config Caddyfile --adapter caddyfile
