# Changelog

All notable changes to QuietBrowse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project scaffold with Electron + electron-vite
- Project documentation: README, LICENSE (MIT), CONTRIBUTING, SECURITY, CHANGELOG
- GitHub Actions CI/CD pipeline configuration
- electron-builder configuration for Windows NSIS installer
- SignPath.io code signing integration (pending approval)
- Network ad and tracker blocking with a persisted per-site exception
- Private tabs with isolated, non-persistent Chromium sessions
- Searchable bookmarks and history panels with direct navigation and removal
- Download tracking panel with progress state and file opening
- Keyboard shortcuts for bookmarks (`Ctrl+B`), history (`Ctrl+H`), and downloads (`Ctrl+J`)
