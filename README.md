# FrontierAtlas

This repository contains the core application components for FrontierAtlas, structured to support multi-contributor workflows.

## Project Structure

- **`frontend/`**: The Next.js web application for FrontierAtlas.

## Collaboration & Git Workflow

To ensure smooth collaboration across multiple branches:

1. **Main Branch Protection**: The `main` branch represents production-ready code. Do not push directly to `main`.
2. **Branch Naming Conventions**: Always branch off `main` using descriptive naming:
   - `feat/<short-description>` for new features (e.g., `feat/auth-portal`)
   - `fix/<short-description>` for bug fixes (e.g., `fix/header-overlap`)
   - `chore/<short-description>` for tooling/restructuring (e.g., `chore/dependency-upgrade`)
3. **Submitting Work**:
   - Push your branch to the remote repository.
   - Open a **Pull Request (PR)** targeting `main`.
   - Ensure all discussions are resolved before merging.
