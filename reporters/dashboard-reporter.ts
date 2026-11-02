import fs from 'node:fs';
import path from 'node:path';
import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

type Status = 'passed' | 'failed' | 'error' | 'cancelled';

interface TestRecord {
  title: string;
  suite: string;
  status: Status;
  duration: number;
}

interface RunRecord {
  date: string;
  duration: number;
  tests: TestRecord[];
}

const MAX_RUNS = 200;
const DAYS = 7;
const COLORS = { passed: '#2fa84f', failed: '#c8102e', error: '#f5a300', cancelled: '#c9c9c9' };

function classify(result: TestResult): Status {
  if (result.status === 'passed') return 'passed';
  if (result.status === 'skipped') return 'cancelled';
  if (result.status === 'timedOut' || result.status === 'interrupted') return 'error';
  return 'failed';
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h ? `${h}h` : '', h || m ? `${m}m` : '', `${sec}s`].filter(Boolean).join(' ');
}

const formatMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`);

class DashboardReporter implements Reporter {
  private readonly outDir: string;
  private readonly latest = new Map<string, TestRecord>();
  private startedAt = Date.now();

  constructor(options: { outputFolder?: string } = {}) {
    this.outDir = path.resolve(options.outputFolder ?? 'dashboard');
  }

  onBegin() {
    this.startedAt = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Later attempts overwrite earlier ones so retries count once, by final outcome.
    this.latest.set(test.id, {
      title: test.titlePath().slice(3).join(' › '),
      suite: path.basename(test.location.file).replace(/\.spec\.\w+$/, ''),
      status: classify(result),
      duration: result.duration,
    });
  }

  onEnd(_result: FullResult) {
    fs.mkdirSync(this.outDir, { recursive: true });
    const historyFile = path.join(this.outDir, 'history.json');
    let history: RunRecord[] = [];
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch {
      // First run: no history yet.
    }
    history.push({
      date: new Date().toISOString(),
      duration: Date.now() - this.startedAt,
      tests: [...this.latest.values()],
    });
    history = history.slice(-MAX_RUNS);
    fs.writeFileSync(historyFile, JSON.stringify(history));
    fs.writeFileSync(path.join(this.outDir, 'index.html'), render(history));
    console.log(`Dashboard: ${path.join(this.outDir, 'index.html')}`);
  }
}

function render(history: RunRecord[]): string {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (DAYS - 1));
  start.setHours(0, 0, 0, 0);
  const runs = history.filter((r) => new Date(r.date) >= start);
  const all = runs.flatMap((r) => r.tests);

  const count = (s: Status) => all.filter((t) => t.status === s).length;
  const counts = { passed: count('passed'), failed: count('failed'), error: count('error'), cancelled: count('cancelled') };
  const total = all.length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const totalTime = runs.reduce((sum, r) => sum + r.duration, 0);

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test case dashboard</title><style>${STYLE}</style></head>
<body>
${sidebar()}
<main>
  <header class="panel head">
    <h1>Test case dashboard</h1>
    <span class="chip">Last ${DAYS} days</span>
    <span class="chip">${esc(dayKey(start))}</span><span class="to">to</span><span class="chip">${esc(dayKey(end))}</span>
    <span class="chip">Sauce Demo · Chromium</span>
  </header>
  <section class="cards">
    ${card('Test cases completed', String(total), '#555')}
    ${card('Total execution time', formatDuration(totalTime), '#555')}
    ${card('Passed', `${pct(counts.passed)}%`, COLORS.passed)}
    ${card('Failed', `${pct(counts.failed)}%`, COLORS.failed)}
    ${card('Error', `${pct(counts.error)}%`, COLORS.error)}
    ${card('Cancelled', `${pct(counts.cancelled)}%`, COLORS.cancelled)}
    ${card('Runs', String(runs.length), '#6b4fbb')}
  </section>
  <section class="panel"><div class="ph"><h2>Test case runs per day</h2></div>${lineChart(runs, start)}${legend()}</section>
  <section class="row">
    <div class="panel half"><div class="ph"><h2>Test case results by status</h2></div>${donut(counts, total)}${legend()}${statusTable(counts, pct)}</div>
    <div class="panel half"><div class="ph"><h2>Top 10 longest running test cases</h2></div>${longestTable(all)}</div>
  </section>
  <section class="row">
    <div class="panel half"><div class="ph"><h2>Top 10 test case failures</h2></div>${rankedTable(all, 'failed', 'Total failures', '!')}</div>
    <div class="panel half"><div class="ph"><h2>Top 10 test case errors</h2></div>${rankedTable(all, 'error', 'Total errors', '▲')}</div>
  </section>
</main></body></html>`;
}

function card(label: string, value: string, color: string) {
  return `<div class="card"><div class="cl"><i style="background:${color}"></i>${esc(label)}</div><div class="cv">${esc(value)}</div></div>`;
}

function legend() {
  const item = (c: string, l: string) => `<span><i style="background:${c}"></i>${l}</span>`;
  return `<div class="legend">${item(COLORS.passed, 'Pass')}${item(COLORS.failed, 'Fail')}${item(COLORS.error, 'Error')}${item(COLORS.cancelled, 'Cancelled')}</div>`;
}

function lineChart(runs: RunRecord[], start: Date) {
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const series: Record<Status, number[]> = { passed: [], failed: [], error: [], cancelled: [] };
  for (const d of days) {
    const tests = runs.filter((r) => dayKey(new Date(r.date)) === dayKey(d)).flatMap((r) => r.tests);
    for (const s of Object.keys(series) as Status[]) series[s].push(tests.filter((t) => t.status === s).length);
  }
  const max = Math.max(5, ...Object.values(series).flat());
  const top = Math.ceil(max / 5) * 5;
  const W = 1000, H = 240, L = 40, R = 20, T = 15, B = 30;
  const x = (i: number) => L + (i * (W - L - R)) / (DAYS - 1);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);

  const grid = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const v = (top / 5) * i;
      return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#eee"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    })
    .join('');
  const labels = days
    .map((d, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}</text>`)
    .join('');
  const lines = (Object.keys(series) as Status[])
    .map((s) => {
      const pts = series[s].map((v, i) => `${x(i)},${y(v)}`).join(' ');
      const dots = series[s].map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${COLORS[s]}"/>`).join('');
      return `<polyline points="${pts}" fill="none" stroke="${COLORS[s]}" stroke-width="2"/>${dots}`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart">${grid}${labels}${lines}</svg>`;
}

function donut(counts: Record<Status, number>, total: number) {
  const r = 60, c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = total
    ? (Object.keys(counts) as Status[])
        .filter((s) => counts[s])
        .map((s) => {
          const len = (counts[s] / total) * c;
          const el = `<circle r="${r}" cx="90" cy="90" fill="none" stroke="${COLORS[s]}" stroke-width="40" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 90 90)"/>`;
          offset += len;
          return el;
        })
        .join('')
    : `<circle r="${r}" cx="90" cy="90" fill="none" stroke="#eee" stroke-width="40"/>`;
  return `<svg viewBox="0 0 180 180" class="donut">${arcs}</svg>`;
}

function statusTable(counts: Record<Status, number>, pct: (n: number) => number) {
  const rows: [string, Status, string, string][] = [
    ['Passed', 'passed', '✓', 'b-pass'],
    ['Failed', 'failed', '!', 'b-fail'],
    ['Error', 'error', '▲', 'b-err'],
    ['Cancelled', 'cancelled', '×', 'b-can'],
  ];
  return `<table class="boxed"><tr><th>Test status</th><th>Percentage</th><th>Total number</th></tr>${rows
    .map(([l, s, icon, cls]) => `<tr><td>${l}</td><td>${pct(counts[s])}%</td><td><span class="badge ${cls}"><b>${icon}</b>${counts[s]}</span></td></tr>`)
    .join('')}</table>`;
}

function group(all: TestRecord[]) {
  const map = new Map<string, TestRecord[]>();
  for (const t of all) {
    const key = `${t.suite}\u0000${t.title}`;
    map.set(key, [...(map.get(key) ?? []), t]);
  }
  return [...map.values()];
}

function longestTable(all: TestRecord[]) {
  const rows = group(all)
    .map((g) => {
      const d = g.map((t) => t.duration);
      return { g: g[0], avg: d.reduce((a, b) => a + b, 0) / d.length, max: Math.max(...d) };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);
  if (!rows.length) return empty();
  return `<table class="list"><tr><th>Test case</th><th>Avg</th><th>Max</th><th>Model / suite</th></tr>${rows
    .map((r) => `<tr><td class="tc" title="${esc(r.g.title)}">${esc(r.g.title)}</td><td>${formatMs(r.avg)}</td><td>${formatMs(r.max)}</td><td><span class="suite">${esc(r.g.suite)}</span></td></tr>`)
    .join('')}</table>`;
}

function rankedTable(all: TestRecord[], status: Status, header: string, icon: string) {
  const rows = group(all)
    .map((g) => ({ g: g[0], n: g.filter((t) => t.status === status).length }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 10);
  if (!rows.length) return empty('Nothing to report in this period 🎉');
  const cls = status === 'failed' ? 'b-fail' : 'b-err';
  return `<table class="list"><tr><th>Test case</th><th>${header}</th><th>Model / suite</th></tr>${rows
    .map((r) => `<tr><td class="tc" title="${esc(r.g.title)}">${esc(r.g.title)}</td><td><span class="badge ${cls}"><b>${icon}</b>${r.n}</span></td><td><span class="suite">${esc(r.g.suite)}</span></td></tr>`)
    .join('')}</table>`;
}

const empty = (msg = 'No test data yet') => `<p class="empty">${msg}</p>`;

function sidebar() {
  const item = (l: string, active = false) => `<div class="nav${active ? ' on' : ''}">${l}</div>`;
  return `<aside><div class="logo">🍆 saucedemo</div>${item('Dashboards')}<div class="sub on">Test Case</div><div class="sub">Suite</div>${item('Designer')}${item('Controller')}${item('Insights')}<div class="spacer"></div>${item('System')}${item('Documentation')}${item('Log Out')}</aside>`;
}

const STYLE = `
*{box-sizing:border-box}body{margin:0;display:flex;font:13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;background:#f1f1f3;color:#2b2b33}
aside{width:104px;min-height:100vh;background:#3b2a5c;color:#fff;padding:12px 8px;display:flex;flex-direction:column;gap:4px;font-size:11px;position:sticky;top:0;height:100vh}
.logo{font-weight:700;font-size:12px;margin-bottom:14px;text-align:center}.nav{padding:8px 6px;border-radius:4px}.nav.on{background:#6b4fbb}
.sub{padding:4px 6px 4px 14px;opacity:.8}.sub.on{opacity:1;font-weight:600}.spacer{flex:1}
main{flex:1;padding:14px;max-width:1400px;margin:0 auto}
.panel{background:#fff;border:1px solid #e3e3e8;border-radius:6px;padding:12px 14px;margin-bottom:14px}
.head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.head h1{font-size:15px;margin:0 12px 0 0}
.chip{border:1px solid #d8d8df;border-radius:4px;padding:5px 10px;background:#fff}.to{color:#888}
.cards{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:14px}
.card{background:#fff;border:1px solid #e3e3e8;border-radius:6px;padding:10px 12px}
.cl{color:#666;display:flex;align-items:center;gap:6px;font-size:12px}.cl i,.legend i{display:inline-block;width:10px;height:10px;border-radius:50%}
.cv{font-size:18px;font-weight:600;margin-top:6px}
.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}h2{font-size:14px;margin:0}
.chart{width:100%;height:auto}.chart text{font-size:11px;fill:#666}
.legend{display:flex;gap:18px;justify-content:center;margin:6px 0 10px;font-size:11px;color:#555}.legend span{display:flex;align-items:center;gap:6px}.legend i{border-radius:2px;width:22px;height:10px}
.row{display:flex;gap:14px;align-items:flex-start}.half{flex:1;min-width:0}
.donut{display:block;width:180px;margin:6px auto}
table{width:100%;border-collapse:collapse}th{text-align:left;color:#666;font-weight:500;font-size:12px}
th,td{padding:7px 8px;border-bottom:1px solid #eee}
.boxed{border:1px solid #e3e3e8;border-radius:4px}.boxed th{background:#fafafa}
.list .tc{max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.badge{display:inline-flex;align-items:center;gap:5px;border:1px solid;border-radius:4px;padding:1px 7px;font-weight:600}
.badge b{color:#fff;border-radius:50%;width:14px;height:14px;font-size:9px;display:inline-flex;align-items:center;justify-content:center}
.b-pass{border-color:#2fa84f}.b-pass b{background:#2fa84f}.b-fail{border-color:#c8102e}.b-fail b{background:#c8102e}
.b-err{border-color:#f5a300}.b-err b{background:#f5a300}.b-can{border-color:#aaa}.b-can b{background:#aaa}
.suite{background:#f1f1f3;border:1px solid #ddd;border-radius:4px;padding:2px 8px;white-space:nowrap}
.empty{color:#888;text-align:center;padding:28px 0}
@media(max-width:900px){.row{flex-direction:column}.cards{grid-template-columns:repeat(2,1fr)}aside{display:none}}
`;

export default DashboardReporter;
