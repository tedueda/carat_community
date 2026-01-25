#!/bin/bash
set -e

echo "🚀 Deploying to Fly.io..."

export FLYCTL_INSTALL="/home/ubuntu/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

fly deploy --app app-rosqqdae
