# Playwright Saucedemo

Playwright + TypeScript tests for the [Sauce Demo](https://www.saucedemo.com) practice store,
using page objects, shared components, and an authenticated test fixture. Tests use the public
demo accounts published on the login page.

## Setup

```sh
npm install
npx playwright install chromium
```

## Run

```sh
npm test             # headless
npm run test:headed  # watch the browser
npm run report       # open the standard Playwright HTML report
npm run dashboard    # open the dashboard report (macOS)
```

The GitHub Actions workflow also runs a Lighthouse performance audit against
the SauceDemo homepage. The build requires a performance score of at least 80,
and uploads the JSON report as the `lighthouse-performance-report` artifact.
This is a CI lab measurement, not continuous production monitoring.

## Playwright MCP in VS Code

The workspace-root `.mcp.json` configures Microsoft's Playwright MCP server for
browser interaction from Copilot. Open this project folder in VS Code and start
or trust the `playwright` MCP server when prompted. It requires Node.js 18 or
newer and `npx`; the first start downloads `@playwright/mcp` through npm.

MCP browser interactions are separate from `npm test` and do not run this
project's Playwright test suite or generate its reports.

## Layout

- `src/config/` — environment and Playwright test configuration
- `src/pages/` — page objects and SauceDemo UI components
- `src/fixtures/` — authenticated-page fixture and shared test data
- `src/reporters/` — custom dashboard reporter
- `src/utils/` — test-step screenshot helper
- `test-data/` — public SauceDemo test-account data
- `tests/e2e/` — login and inventory tests
- `tests/smoke/` — end-to-end purchase critical path
- `.github/workflows/` — GitHub Actions test, Lighthouse, and dashboard deployment workflow
- `playwright-report/` — generated HTML report, opened with `npm run report` and uploaded by CI
- `dashboard/` — generated test analytics dashboard and run history, published by CI on `main`

## Dashboard report

Every run writes `dashboard/index.html`: summary cards, runs per day, status breakdown, and top-10
tables for the longest-running tests, failures, and errors. Status mapping: **Fail** is an assertion
or test failure, **Error** is a timeout or interrupted run, **Cancelled** is a skipped test.

Run history is kept in `dashboard/history.json` (last 200 runs), so charts build up locally over time.

On `main`, CI publishes the dashboard to GitHub Pages
(https://paupau-1712.github.io/Playwright_Saucedemo/). Before each run it downloads the previously
published `history.json`, so the charts keep accumulating across pushes and nightly runs.
