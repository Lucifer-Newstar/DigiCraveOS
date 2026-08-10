# 🤝 Contributing to DigiCraveOS

Thanks for helping improve DigiCraveOS. Keep changes practical, clear, and easy to follow.

## Getting started

1. Clone the repository and create a working branch from `main`.
2. Install dependencies in both application folders:

   ```bash
   cd Restaurant_POS_System/pos-backend && npm install
   cd ../pos-frontend && npm install
   ```

3. Create `.env` files from the available `.env.example` files.
4. Start MongoDB, then run the backend on port `8000` and the frontend on port `5173`.
5. Make your change, test it, and keep the related documentation up to date.

## Project guidelines

- Follow the existing code style and naming patterns.
- Keep commits short and descriptive.
- Add or update tests when behavior changes.
- Avoid committing secrets, local `.env` files, generated builds, or dependency folders.
- Keep the docs casual and specific to DigiCraveOS.

## Pull requests

- Branch from `main`.
- Explain what changed and why.
- Include the tests or checks you ran.
- Keep unrelated cleanup out of feature changes.
- Wait for review before merging.

## Reporting an issue

For bugs or ideas, add a clear note describing:

- What happened
- What you expected
- How to reproduce it
- Any useful logs or screenshots

## Ownership and license

DigiCraveOS is an independent project. The repository documentation and project-specific material are kept here for this project.

The code is released under the project license in `LICENSE`. Libraries and services used by the app remain subject to their own licenses and terms.
