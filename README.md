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
npm run report      # open the standard Playwright HTML report
npm run dashboard   # open the dashboard report (macOS)
```

## Layout

- `pages/` — page objects (`LoginPage`, `InventoryPage`)
- `tests/` — login, inventory, and checkout specs

## Dashboard report

Every run writes `dashboard/index.html`: summary cards, runs per day, status breakdown, and top-10
tables for the longest-running tests, failures, and errors. Status mapping: **Fail** is an assertion
or test failure, **Error** is a timeout or interrupted run, **Cancelled** is a skipped test.

Run history is kept in `dashboard/history.json` (last 200 runs), so charts build up locally over time.

On `main`, CI publishes the dashboard to GitHub Pages
(https://paupau-1712.github.io/Playwright_Saucedemo/). Before each run it downloads the previously
published `history.json`, so the charts keep accumulating across pushes and nightly runs.
