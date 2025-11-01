# Pollara

#### By [Matthew Emeh](https://github.com/matthewemeh) @1st of November, 2025

<br>

## Overview

A modern web application built with **React**, **TypeScript**, and **Vite**. This project provides a robust foundation for scalable, maintainable, and high-performance frontend development, featuring hot module replacement, strict linting, and a modular architecture. It is deployed at: [https://pollara-tkcx.vercel.app](https://pollara-tkcx.vercel.app)

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [ESLint & Code Quality](#eslint--code-quality)
- [Configuration](#configuration)
- [Contributing](#contributing)

---

## Features

- ⚡️ **Vite** for lightning-fast development and builds
- ⚛️ **React** with TypeScript for type-safe UI development
- ♻️ **Hot Module Replacement** (HMR) for instant feedback
- 🧹 **ESLint** with recommended and type-aware rules
- 🗂️ Modular folder structure for components, pages, hooks, and utilities
- 📦 Ready for deployment (e.g., Vercel)

---

## Project Structure

```
frontend/
├── public/                # Static assets and ML models
├── src/                   # Application source code
│   ├── assets/            # Images, icons, and branding
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files
│   ├── contexts/          # Application context(s)
│   ├── helpers/           # Helper utilities
│   ├── hooks/             # Custom React hooks
│   ├── interfaces/        # TypeScript type definitions
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components (by route)
│   ├── routes/            # Route definitions
│   ├── schemas/           # Yup Schema definitions for some forms in the application
│   ├── services/          # API and store logic
│   ├── styles/            # CSS and style files
│   ├── types/             # Shared types
│   └── utils/             # Utility functions
├── package.json           # Project metadata and scripts
├── tsconfig*.json         # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Project documentation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/matthewemeh/pollara-build-gems
   # or
   git clone git@github.com:matthewemeh/pollara-build-gems.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

---

## Available Scripts

- `dev` – Start the development server with HMR
- `build` – Build the app for production
- `preview` – Preview the production build locally
- `lint` – Run ESLint on the codebase

Example:

```bash
npm run build
npm run preview
```

---

## ESLint & Code Quality

This project uses ESLint with TypeScript and React plugins for code quality and consistency.

### Recommended ESLint Configuration

For production applications, enable type-aware lint rules in `eslint.config.js`:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    // or stricter:
    ...tseslint.configs.strictTypeChecked,
    // for stylistic rules:
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

#### React-Specific Lint Rules

Install and configure [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for additional React linting:

```js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

---

## Configuration

- **TypeScript:** See `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json` for project and build settings.
- **Vite:** See `vite.config.ts` for dev/build configuration.
- **Environment Variables:** Add `.env` files as needed for secrets and environment-specific settings. Kindly make a request from owner - [Matthew Emeh](https://github.com/matthewemeh)

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request
