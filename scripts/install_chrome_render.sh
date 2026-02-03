#!/usr/bin/env bash
set -e

# Instala dependencias y Google Chrome (Debian/Ubuntu)
sudo apt-get update
sudo apt-get install -y wget gnupg ca-certificates \
  fonts-liberation libxss1 libappindicator3-1 libatk-bridge2.0-0 \
  libgtk-3-0 libasound2 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxdamage1 libxrandr2 libgbm1 libnss3 libatk1.0-0 libpangocairo-1.0-0 \
  libxshmfence1

wget -q -O /tmp/google-chrome-stable_current_amd64.deb \
  https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

sudo apt-get install -y /tmp/google-chrome-stable_current_amd64.deb || sudo apt --fix-broken install -y
rm /tmp/google-chrome-stable_current_amd64.deb

# Exponer ruta para Puppeteer
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable' | sudo tee /etc/profile.d/puppeteer_path.sh
sudo chmod +x /etc/profile.d/puppeteer_path.sh

echo "Chrome instalado y PUPPETEER_EXECUTABLE_PATH definido."