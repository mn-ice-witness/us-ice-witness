#!/bin/bash
# Local development server for MN ICE Witness
#
# Usage:
#   ./bin/run-server.sh                    # Run with Cloudflare Functions (recommended)
#   ./bin/run-server.sh --simple           # Run simple Python server (no Functions)
#   ./bin/run-server.sh --throttle 3g      # Run with bandwidth throttling
#   ./bin/run-server.sh --throttle edge    # Very slow connection
#
# Throttle profiles:
#   edge   - 50 Kbit/s, 400ms delay (2G/Edge)
#   3g     - 100 Kbit/s, 200ms delay (Slow 3G)
#   fast3g - 750 Kbit/s, 100ms delay (Fast 3G)
#   4g     - 1500 Kbit/s, 50ms delay (Slow 4G)
#
# The default mode uses Wrangler to emulate Cloudflare Pages locally,
# including Functions support for path-based URLs like /incident/<slug>.
#
# Requires: Node.js (npx will auto-install wrangler if needed)

cd "$(dirname "$0")/.." || exit 1

THROTTLE_ENABLED=false
THROTTLE_PROFILE=""
SIMPLE_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --simple)
            SIMPLE_MODE=true
            shift
            ;;
        --throttle)
            THROTTLE_ENABLED=true
            THROTTLE_PROFILE="${2:-3g}"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Throttle functions
start_throttle() {
    local profile=$1
    local bw delay

    case $profile in
        edge)   bw="50Kbit/s";   delay=400 ;;
        3g)     bw="100Kbit/s";  delay=200 ;;
        fast3g) bw="750Kbit/s";  delay=100 ;;
        4g)     bw="1500Kbit/s"; delay=50  ;;
        *)
            echo "Unknown throttle profile: $profile"
            echo "Available: edge, 3g, fast3g, 4g"
            exit 1
            ;;
    esac

    echo "Enabling bandwidth throttling: $profile ($bw, ${delay}ms delay)"
    echo "Note: This requires sudo and affects all network traffic on this Mac."
    echo ""

    sudo dnctl pipe 1 config bw "$bw" delay "$delay"
    echo "dummynet out proto tcp from any to any pipe 1" | sudo pfctl -f -
    sudo pfctl -e 2>/dev/null
}

stop_throttle() {
    echo ""
    echo "Disabling bandwidth throttling..."
    sudo pfctl -d 2>/dev/null
    sudo dnctl -q flush
}

# Cleanup function
cleanup() {
    echo ""
    echo "Server stopped."
    if [[ "$THROTTLE_ENABLED" == true ]]; then
        stop_throttle
    fi
}

trap cleanup EXIT

# Start throttling if requested
if [[ "$THROTTLE_ENABLED" == true ]]; then
    start_throttle "$THROTTLE_PROFILE"
fi

# Start the server
if [[ "$SIMPLE_MODE" == true ]]; then
    echo "Starting simple Python server (no Cloudflare Functions)..."
    echo "Note: Path-based URLs like /incident/slug will not work in this mode."
    echo "Server running at http://localhost:8000"
    python3 -m http.server 8000 --directory docs
else
    echo "Starting Cloudflare Pages local development server..."
    echo "This includes full Functions support for path-based URLs."
    echo ""
    npx wrangler pages dev docs --port 8000 --ip 0.0.0.0
fi
