# Digi-Chest

Digi-Chest is an Expo and React Native game that turns walks into treasure hunts. Players follow clues, travel to locations, complete mini-games, and collect digital treasure.

## Current status

The Expo app is connected to Firebase Data Connect. `App.tsx` loads the public item list when it opens and creates a demo item only when the add button is pressed. We're each working on separate pages of the app

Talmage - Map
Silas - Leaderboard & Firebase
Thomas - Inventory
Jason - Settings & Authentication

## Technology

- React Native
- Expo
- Expo Router (navigation)
- TypeScript
- React Native Web
- Firebase Data Connect
- VS Code
- NodeJS
- Firebase (PostgreSQL)

## VSCode Extentions Used
- Expo Tools (expo.vscode-expo-tools
)
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets
)
- ESLint (dbaeumer.vscode-eslint)
- Prettier - Code Formatter (esbenp.prettier-vscode)
- Error Lens (usernamehw.errorlens)

## Getting Started

### Prerequisites

Install:

## Install and run

```bash
npm install
npm start
```

Use `npm run android`, `npm run ios`, or `npm run web` for a specific target. Run `npm run typecheck` to check the TypeScript code.

## Project structure

```text
Digi-Chest/
├── app/                      # Screens (Expo Router: each file is a route)
│   ├── _layout.tsx           # Root layout
│   └── (tabs)/               # Pages shown in the bottom tab bar
│       ├── _layout.tsx       # Tab bar setup (order, titles, icons)
│       ├── index.tsx         # Interactive Map page
│       ├── leaderboard.tsx   # Leaderboard page
│       ├── inventory.tsx     # Inventory page
│       └── settings.tsx      # Settings page
├── components/      # Reusable UI components
├── constants/       # Shared values such as colors
├── src/firebase.ts   # Firebase and Data Connect initialization
├── dataconnect/      # Data Connect schema and operations
├── app.json         # Expo application configuration
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── README.md        # Project documentation
```

The schema, connector, operations, and seed data are kept separate because Firebase Data Connect treats them as different inputs. The operations can remain together in `queries.gql`; split them into more files only when the file becomes difficult to navigate.

## Firebase Data Connect workflow

The generated SDK is derived from `dataconnect/schema` and `dataconnect/example`. Regenerate it after changing either the schema or operations:

```bash
npx firebase-tools@latest dataconnect:sdk:generate
```

To run the local emulator or load the optional demo data:

```bash
npx firebase-tools@latest emulators:start --only dataconnect
npx firebase-tools@latest dataconnect:execute dataconnect/seed_data.gql
```

Deploy the Data Connect service with:

```bash
npx firebase-tools@latest deploy --only dataconnect
```

The command updates `src/dataconnect-generated/` and the local package reference in `package.json`. The Firebase CLI owns that output; application code should import it, not edit it.

## Generated and local-only files

The following are disposable and intentionally ignored by Git:

- `.firebase/` — Firebase editor metadata
- `dataconnect/.dataconnect/` — local Data Connect emulator database state
- `*.log` — Firebase and emulator logs

Deleting those files resets only local tooling state; Firebase can recreate them.
Add the project's license information here.

## Map Tab Information
- Run npx expo install expo-maps (expo-maps)
