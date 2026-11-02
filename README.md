# Playwright Saucedemo

Playwright + TypeScript tests for the [Sauce Demo](https://www.saucedemo.com) practice store,
using the Page Object Model. Tests use the public demo accounts published on the login page.

## Setup

```sh
npm install
npx playwright install chromium
```

## Run

```sh
npm test            # headless
npm run test:headed # watch the browser
npm run report      # open the HTML report
```

## Layout

- `pages/` — page objects (`LoginPage`, `InventoryPage`)
- `tests/` — login, inventory, and checkout specs
