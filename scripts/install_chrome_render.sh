#!/usr/bin/env bash
set -e
#!/usr/bin/env bash
set -euo pipefail

echo "== Installing Google Chrome and dependencies for Puppeteer (non-sudo friendly) =="

# This script is intended to be run as root inside a Docker build (no sudo).
export DEBIAN_FRONTEND=noninteractive
apt-get update

echo "Installing required packages..."
apt-get install -y --no-install-recommends \
  ca-certificates \
  wget \
  gnupg \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxss1 \
  libxtst6 \
  lsb-release \
  xdg-utils

echo "Downloading Google Chrome package..."
wget -q -O /tmp/google-chrome-stable_current_amd64.deb \
  https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

echo "Installing google-chrome-stable..."
apt-get install -y --no-install-recommends /tmp/google-chrome-stable_current_amd64.deb || apt-get -f install -y
rm -f /tmp/google-chrome-stable_current_amd64.deb

echo "Configuring environment for Puppeteer..."
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable' > /etc/profile.d/puppeteer_path.sh
chmod +x /etc/profile.d/puppeteer_path.sh

echo "Installation complete. Chrome path: /usr/bin/google-chrome-stable"
echo "PUPPETEER_EXECUTABLE_PATH set in /etc/profile.d/puppeteer_path.sh"

exit 0