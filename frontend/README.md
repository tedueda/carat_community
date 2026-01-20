# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## ⚠️ API URL Configuration (IMPORTANT)

**Never hardcode API URLs in the codebase!** This prevents deployment issues with stale URLs.

### Development
- Copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:8000`
- Or leave it empty to use Vite's proxy

### Production (Netlify)
1. Go to **Netlify Dashboard** > **Site settings** > **Build & deploy** > **Environment**
2. Add environment variable: `VITE_API_URL` = `https://your-backend-url.com`
3. **Do NOT** add URLs to `netlify.toml` or `.env.production`

### Code Guidelines
- Always import `API_URL` from `src/config.ts`
- Never define local `API_URL` constants in components
- Never use fallback URLs like `|| 'https://...'`

```typescript
// ✅ Correct
import { API_URL } from '../config';

// ❌ Wrong - DO NOT DO THIS
const API_URL = import.meta.env.VITE_API_URL || 'https://old-url.com';
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
