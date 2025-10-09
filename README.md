# Tongo Documentation

Official documentation for the Tongo Protocol and TypeScript SDK. Built with [mdbook](https://rust-lang.github.io/mdBook/).

## 🚀 Quick Start

### 1. Install mdbook (one time only)

```bash
# Install via cargo (Rust package manager)
cargo install mdbook

# Or on Arch Linux
sudo pacman -S mdbook
```

### 2. Build and View

```bash
# Navigate to this directory
cd /home/john/fatsolutions/tongo-v1/tongo-docs

# Option A: Build static HTML
mdbook build
# Output in: book/index.html

# Option B: Serve with live reload (RECOMMENDED)
mdbook serve
# Opens at: http://localhost:3000
# Auto-reloads when you edit files!

# Option C: Serve and auto-open browser
mdbook serve --open
```

That's it! The docs are now viewable at http://localhost:3000 🎉

## 📝 Editing Documentation

All documentation is written in Markdown and lives in the `src/` directory:

```
src/
├── SUMMARY.md              # Table of contents (navigation)
├── README.md               # Landing page
│
├── protocol/               # Protocol Documentation
│   ├── introduction.md
│   ├── encryption.md
│   ├── transfer.md
│   ├── auditor.md
│   └── contracts.md
│
└── sdk/                    # SDK Documentation
    ├── README.md           # SDK overview
    ├── installation.md
    ├── quick-start.md
    │
    ├── concepts/           # Core concepts
    │   ├── accounts.md
    │   ├── operations.md
    │   ├── encrypted-state.md
    │   └── key-management.md
    │
    ├── guides/             # Step-by-step guides
    │   ├── funding.md
    │   ├── transfers.md
    │   ├── withdrawals.md
    │   ├── rollover.md
    │   ├── wallet-integration.md
    │   └── transaction-history.md
    │
    ├── api/                # API reference
    │   ├── account.md
    │   ├── operations.md
    │   └── types.md
    │
    └── examples/           # Real-world examples
        ├── complete-workflow.md
        └── react-integration.md
```

### Making Changes

1. **Edit any `.md` file** in the `src/` directory
2. **With `mdbook serve` running**: Changes appear instantly in browser!
3. **Without serve**: Run `mdbook build` to rebuild

### Adding New Pages

1. Create a new `.md` file in the appropriate `src/` subdirectory
2. Add an entry to `src/SUMMARY.md` to include it in navigation:

```markdown
- [My New Page](path/to/new-page.md)
```

## 📁 Project Structure

```
tongo-docs/
├── book.toml           # mdbook configuration
├── src/                # Markdown source files (EDIT THESE)
│   ├── SUMMARY.md      # Navigation structure
│   ├── README.md       # Landing page
│   ├── protocol/       # Protocol docs
│   └── sdk/            # SDK docs
├── theme/              # Custom styling
│   └── custom.css      # Cyberpunk theme
├── book/               # Generated HTML (gitignored)
└── README.md           # This file
```

**Important**: Only edit files in `src/`. The `book/` directory is auto-generated.

## 🎨 Custom Theming

The docs use a custom cyberpunk theme matching the Tongo landing page:

### Colors
- **Jet Black**: `#0d0d0d` - Background
- **Deep Orange**: `#ff4d00` - Primary accent, headers
- **Warm Coral**: `#ff693a` - Secondary accent
- **Ice Blue**: `#b9d3d7` - Links, subtle text
- **Soft Gray**: `#d1d1cf` - Body text

### Typography
- **Primary**: JetBrains Mono
- **Monospace**: IBM Plex Mono

### Customizing
Edit `theme/custom.css` to modify:
- Colors and styling
- Fonts and typography
- Layout and spacing
- Animations and effects

After changes, rebuild with `mdbook build` or wait for auto-reload.

## 🚀 Deployment

### GitHub Pages

```bash
# Build the docs
mdbook build

# Push the book/ directory to gh-pages branch
git subtree push --prefix book origin gh-pages
```

### Vercel / Netlify / Cloudflare Pages

1. Connect your repository
2. Set build command: `mdbook build`
3. Set publish directory: `book`

### Docker

```dockerfile
FROM rust:latest as builder
RUN cargo install mdbook
COPY . /docs
WORKDIR /docs
RUN mdbook build

FROM nginx:alpine
COPY --from=builder /docs/book /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t tongo-docs .
docker run -p 8080:80 tongo-docs
```

## 📖 Documentation Content

### What's Included

**Protocol Documentation:**
- Introduction to Tongo confidential payments
- Encryption system (ElGamal, homomorphic encryption)
- Transfer protocol and ZK proofs
- Auditing and compliance features
- Cairo contracts overview

**SDK Documentation:**
- Installation and quick start
- Core concepts (Accounts, Operations, Encrypted State, Key Management)
- Step-by-step guides (Funding, Transfers, Withdrawals, Rollover)
- Wallet integration patterns
- Complete API reference
- Real-world examples (React integration, complete workflows)

### Code Examples

All code examples are:
- ✅ Verified against actual SDK source code
- ✅ Tested for correctness
- ✅ Based on working patterns from production apps
- ✅ TypeScript with full type annotations

## 🔧 Troubleshooting

### mdbook not found

```bash
# Make sure cargo bin is in PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Or reinstall
cargo install mdbook
```

### Port already in use

```bash
# Use a different port
mdbook serve --port 3001
```

### Changes not showing

```bash
# Hard rebuild
mdbook clean
mdbook build
```

## 🔗 Links

- **GitHub**: https://github.com/fatlabsxyz/tongo
- **npm Package**: @fatsolutions/tongo-sdk
- **Website**: https://tongo.cash
