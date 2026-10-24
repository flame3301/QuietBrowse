# Contributing to QuietBrowse

Thank you for your interest in contributing! QuietBrowse is an open-source project and we welcome contributions of all kinds.

## Getting started

1. **Fork** this repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Run** the development server: `npm run dev`
5. **Create a branch** for your changes: `git checkout -b feat/your-feature`

## Development

### Project structure

```
QuietBrowse/
├── src/
│   ├── main/           # Electron main process
│   │   └── index.js    # App entry point, window creation
│   ├── preload/        # Preload scripts (bridge between main & renderer)
│   │   └── index.js    # Exposed APIs for the renderer
│   └── renderer/       # Browser UI (HTML/CSS/JS)
│       ├── index.html  # Main window HTML
│       ├── index.css   # Design system and styles
│       └── index.js    # UI logic
├── build/              # Build resources (icons, installer assets)
├── electron.vite.config.mjs
├── package.json
└── README.md
```

### Scripts

- `npm run dev` — Start in development mode with hot reload
- `npm run build` — Build for production
- `npm run dist:win` — Create Windows installer

### Code style

- **JavaScript** with ES modules (`import`/`export`)
- **2-space indentation**, LF line endings
- Vanilla CSS — no frameworks
- Keep things simple and readable

## Pull requests

1. Keep PRs focused — one feature or fix per PR
2. Write clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add reading mode`
   - `fix: tab close button alignment`
   - `docs: update keyboard shortcuts`
3. Test your changes on Windows 10 and 11 if possible
4. Update the README if your change affects user-facing behavior

## Issues

- Use the issue tracker for bug reports and feature requests
- Include your Windows version and QuietBrowse version
- For bugs, include steps to reproduce

## Code of Conduct

Be kind, be respectful, be constructive. We're all here to make a good tool.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
