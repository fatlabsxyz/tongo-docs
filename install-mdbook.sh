#!/bin/bash
# Install mdbook for Vercel deployment

echo "Installing mdbook..."

# Download pre-built mdbook binary
curl -L https://github.com/rust-lang/mdBook/releases/download/v0.4.40/mdbook-v0.4.40-x86_64-unknown-linux-gnu.tar.gz | tar xz

# Make it executable
chmod +x mdbook

# Move to a location in PATH
mkdir -p $HOME/bin
mv mdbook $HOME/bin/
export PATH="$HOME/bin:$PATH"

echo "mdbook installed successfully"
mdbook --version
