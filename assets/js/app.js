lucide.createIcons();

let DOCS_CONFIG = null;
let NAVIGATION_BY_VERSION = new Map();
let SIDEBAR = [];
let CURRENT_VERSION = null;
let CURRENT_ROUTE = null;
let sidebarScrollEl = null;
let tocObserver = null;
let versionToggleEl = null;
let versionMenuEl = null;
let docsHomeLinkEl = null;

const COPY_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const VERSION_STATUS_LABELS = {
  latest: 'Latest stable',
  maintenance: 'Maintenance',
  preview: 'Preview',
  archived: 'Archived'
};
const DEFAULT_VERSIONS_CONFIG = {
  defaultVersion: 'v1',
  versions: [
    {
      id: 'v1',
      label: 'v1',
      description: 'Current stable release',
      status: 'latest',
      routePrefix: '/v1',
      contentRoot: '',
      navigation: '/assets/data/navigation.json',
      home: '/getting-started'
    }
  ]
};

function normalizePathname(pathname = '/') {
  const cleaned = pathname.replace(/\/+$/, '');
  return cleaned || '/';
}

function trimSlashes(value = '') {
  return value.replace(/^\/+|\/+$/g, '');
}

function normalizeDocPath(pathname = '') {
  const trimmed = trimSlashes(pathname);
  return trimmed ? `/${trimmed}` : null;
}

function getCurrentPath() {
  return normalizePathname(location.pathname);
}

function getVersionConfig(versionId) {
  return DOCS_CONFIG?.versions?.find((version) => version.id === versionId) || null;
}

function getDefaultVersion() {
  return getVersionConfig(DOCS_CONFIG?.defaultVersion) || DOCS_CONFIG?.versions?.[0] || null;
}

function getRoutePrefix(version) {
  return normalizePathname(version?.routePrefix || `/${version?.id || ''}`);
}

function getVersionLabel(version) {
  return version?.label || version?.id || '';
}

function getVersionStatusLabel(version) {
  if (!version) return '';
  return version.statusLabel || VERSION_STATUS_LABELS[version.status] || 'Published';
}

function getVersionDescription(version) {
  return version?.description || getVersionStatusLabel(version);
}

function getVersionHomeDocPath(version) {
  return normalizeDocPath(version?.home || '/getting-started');
}

function buildVersionedPath(docPath = null, version = CURRENT_VERSION) {
  if (!version) return docPath || '/';
  const prefix = getRoutePrefix(version);
  const normalizedDocPath = normalizeDocPath(docPath);
  return normalizedDocPath ? normalizePathname(`${prefix}${normalizedDocPath}`) : prefix;
}

function getVersionHomeHref(version = CURRENT_VERSION) {
  return getRoutePrefix(version);
}

function getVersionStartHref(version = CURRENT_VERSION) {
  return buildVersionedPath(getVersionHomeDocPath(version), version);
}

function buildMarkdownPath(docPath = CURRENT_ROUTE?.docPath, version = CURRENT_VERSION) {
  const normalizedDocPath = normalizeDocPath(docPath);
  if (!normalizedDocPath || !version) return null;

  const contentRoot = trimSlashes(version.contentRoot || '');
  const relativeDocPath = trimSlashes(normalizedDocPath);
  const joined = [contentRoot, relativeDocPath].filter(Boolean).join('/');
  return `/${joined}.md`;
}

function getNavigationForVersion(versionId) {
  return NAVIGATION_BY_VERSION.get(versionId) || [];
}

function parseLinkedRoute(pathname = '/') {
  const normalizedPath = normalizePathname(pathname);
  if (normalizedPath === '/') {
    return {
      version: null,
      versionId: null,
      docPath: null,
      pathname: normalizedPath
    };
  }

  const segments = trimSlashes(normalizedPath).split('/').filter(Boolean);
  const explicitVersion = getVersionConfig(segments[0]);

  if (explicitVersion) {
    return {
      version: explicitVersion,
      versionId: explicitVersion.id,
      docPath: normalizeDocPath(segments.slice(1).join('/')),
      pathname: normalizedPath
    };
  }

  return {
    version: null,
    versionId: null,
    docPath: normalizeDocPath(segments.join('/')),
    pathname: normalizedPath
  };
}

function parseRoute(pathname = getCurrentPath()) {
  const defaultVersion = getDefaultVersion();
  const linkedRoute = parseLinkedRoute(pathname);

  if (!defaultVersion) {
    return {
      ...linkedRoute,
      alias: false
    };
  }

  if (linkedRoute.version) {
    return {
      ...linkedRoute,
      alias: false
    };
  }

  return {
    version: defaultVersion,
    versionId: defaultVersion.id,
    docPath: linkedRoute.docPath,
    pathname: linkedRoute.pathname,
    alias: Boolean(linkedRoute.docPath)
  };
}

function getCanonicalPath(route = CURRENT_ROUTE) {
  if (!route?.version) return '/';
  return route.docPath ? buildVersionedPath(route.docPath, route.version) : getRoutePrefix(route.version);
}

function shouldCanonicalizeRoute(route = CURRENT_ROUTE) {
  return Boolean(route?.alias && route?.docPath);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function loadConfig() {
  try {
    const versionsResponse = await fetch('/assets/data/versions.json');
    const config = await versionsResponse.json();

    DOCS_CONFIG = {
      defaultVersion: config.defaultVersion || DEFAULT_VERSIONS_CONFIG.defaultVersion,
      versions: Array.isArray(config.versions) && config.versions.length
        ? config.versions
        : DEFAULT_VERSIONS_CONFIG.versions
    };

    const navigationEntries = await Promise.all(
      DOCS_CONFIG.versions.map(async (version) => {
        const navResponse = await fetch(version.navigation);
        const navData = await navResponse.json();
        return [version.id, navData.navigation || []];
      })
    );

    NAVIGATION_BY_VERSION = new Map(navigationEntries);
    CURRENT_ROUTE = parseRoute();
    CURRENT_VERSION = CURRENT_ROUTE.version || getDefaultVersion();
    SIDEBAR = getNavigationForVersion(CURRENT_VERSION.id);
    return true;
  } catch (error) {
    console.error('Failed to load docs configuration:', error);
    return false;
  }
}

function highlightJavaScript(code) {
  const tokens = [];
  let pos = 0;

  while (pos < code.length) {
    let matched = false;

    if (code.substr(pos, 2) === '//') {
      const end = code.indexOf('\n', pos);
      const comment = end === -1 ? code.substr(pos) : code.substring(pos, end);
      tokens.push({ type: 'comment', value: comment });
      pos += comment.length;
      matched = true;
    } else if (code.substr(pos, 2) === '/*') {
      const end = code.indexOf('*/', pos + 2);
      const comment = end === -1 ? code.substr(pos) : code.substring(pos, end + 2);
      tokens.push({ type: 'comment', value: comment });
      pos += comment.length;
      matched = true;
    } else if (code[pos] === '"' || code[pos] === "'" || code[pos] === '`') {
      const quote = code[pos];
      let end = pos + 1;
      while (end < code.length) {
        if (code[end] === '\\') {
          end += 2;
          continue;
        }
        if (code[end] === quote) {
          end++;
          break;
        }
        end++;
      }
      tokens.push({ type: 'string', value: code.substring(pos, end) });
      pos = end;
      matched = true;
    } else if (/\d/.test(code[pos])) {
      let end = pos;
      while (end < code.length && /[\d.]/.test(code[end])) end++;
      tokens.push({ type: 'number', value: code.substring(pos, end) });
      pos = end;
      matched = true;
    } else if (/[a-zA-Z_$]/.test(code[pos])) {
      let end = pos;
      while (end < code.length && /[a-zA-Z0-9_$]/.test(code[end])) end++;
      const word = code.substring(pos, end);
      const next = code.slice(end).match(/^\s*/)[0].length + end;

      if (/^(const|let|var|function|async|await|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|from|default|static|get|set|typeof|instanceof|delete|void|yield|this|super|in|of)$/.test(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (/^(true|false|null|undefined|NaN|Infinity)$/.test(word)) {
        tokens.push({ type: 'boolean', value: word });
      } else if (code[next] === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }

      pos = end;
      matched = true;
    }

    if (!matched) {
      tokens.push({ type: 'text', value: code[pos] });
      pos++;
    }
  }

  return tokens.map((token) => {
    const value = escapeHtml(token.value);
    return token.type === 'text' ? value : `<span class="token-${token.type}">${value}</span>`;
  }).join('');
}

function highlightBash(code) {
  const tokens = [];
  let pos = 0;

  while (pos < code.length) {
    let matched = false;

    if (code[pos] === '#') {
      const end = code.indexOf('\n', pos);
      const comment = end === -1 ? code.substr(pos) : code.substring(pos, end);
      tokens.push({ type: 'comment', value: comment });
      pos += comment.length;
      matched = true;
    } else if (code[pos] === '"' || code[pos] === "'") {
      const quote = code[pos];
      let end = pos + 1;
      while (end < code.length) {
        if (code[end] === '\\') {
          end += 2;
          continue;
        }
        if (code[end] === quote) {
          end++;
          break;
        }
        end++;
      }
      tokens.push({ type: 'string', value: code.substring(pos, end) });
      pos = end;
      matched = true;
    } else if (/\d/.test(code[pos])) {
      let end = pos;
      while (end < code.length && /\d/.test(code[end])) end++;
      tokens.push({ type: 'number', value: code.substring(pos, end) });
      pos = end;
      matched = true;
    } else if (/[a-zA-Z_]/.test(code[pos])) {
      let end = pos;
      while (end < code.length && /[a-zA-Z0-9_-]/.test(code[end])) end++;
      const word = code.substring(pos, end);

      if (/^(npm|node|git|cd|ls|mkdir|rm|cp|mv|chmod|grep|sed|awk|cat|echo|curl|wget|tar|if|then|else|fi|for|while|do|done)$/.test(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }

      pos = end;
      matched = true;
    } else if (code[pos] === '-' && code[pos + 1] === '-') {
      let end = pos + 2;
      while (end < code.length && /[a-zA-Z0-9-]/.test(code[end])) end++;
      tokens.push({ type: 'property', value: code.substring(pos, end) });
      pos = end;
      matched = true;
    }

    if (!matched) {
      tokens.push({ type: 'text', value: code[pos] });
      pos++;
    }
  }

  return tokens.map((token) => {
    const value = escapeHtml(token.value);
    return token.type === 'text' ? value : `<span class="token-${token.type}">${value}</span>`;
  }).join('');
}

function highlightJSON(code) {
  const tokens = [];
  let pos = 0;

  while (pos < code.length) {
    let matched = false;

    if (code[pos] === '"') {
      let end = pos + 1;
      while (end < code.length) {
        if (code[end] === '\\') {
          end += 2;
          continue;
        }
        if (code[end] === '"') {
          end++;
          break;
        }
        end++;
      }

      const value = code.substring(pos, end);
      const next = code.slice(end).match(/^\s*/)[0].length + end;
      tokens.push({ type: code[next] === ':' ? 'property' : 'string', value });
      pos = end;
      matched = true;
    } else if (/\d/.test(code[pos]) || (code[pos] === '-' && /\d/.test(code[pos + 1]))) {
      let end = pos;
      if (code[end] === '-') end++;
      while (end < code.length && /[\d.]/.test(code[end])) end++;
      tokens.push({ type: 'number', value: code.substring(pos, end) });
      pos = end;
      matched = true;
    } else if (/[a-z]/.test(code[pos])) {
      let end = pos;
      while (end < code.length && /[a-z]/.test(code[end])) end++;
      const word = code.substring(pos, end);
      tokens.push({ type: /^(true|false|null)$/.test(word) ? 'boolean' : 'text', value: word });
      pos = end;
      matched = true;
    }

    if (!matched) {
      tokens.push({ type: 'text', value: code[pos] });
      pos++;
    }
  }

  return tokens.map((token) => {
    const value = escapeHtml(token.value);
    return token.type === 'text' ? value : `<span class="token-${token.type}">${value}</span>`;
  }).join('');
}

function highlightCode() {
  document.querySelectorAll('pre code').forEach((block) => {
    const language = (block.className.match(/language-(\w+)/) || [])[1] || 'javascript';
    const code = block.textContent;

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'jsx':
      case 'typescript':
      case 'ts':
        block.innerHTML = highlightJavaScript(code);
        break;
      case 'bash':
      case 'sh':
      case 'shell':
        block.innerHTML = highlightBash(code);
        break;
      case 'json':
        block.innerHTML = highlightJSON(code);
        break;
      default:
        block.innerHTML = escapeHtml(code);
    }
  });
}

function addCopyButtons() {
  document.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code || pre.querySelector('.copy-button')) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = COPY_SVG;
    button.title = 'Copy code';

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.innerHTML = CHECK_SVG;
        button.classList.add('copied');
        setTimeout(() => {
          button.innerHTML = COPY_SVG;
          button.classList.remove('copied');
        }, 2000);
      } catch (error) {
        console.error('Failed to copy code:', error);
      }
    });

    pre.appendChild(button);
  });
}

function flattenNavigation(items) {
  const flat = [];

  function visit(nodes) {
    nodes.forEach((node) => {
      if (node.path) flat.push(node);
      if (node.children) visit(node.children);
    });
  }

  visit(items);
  return flat;
}

function isPublishedDocPath(docPath, versionId = CURRENT_VERSION?.id) {
  const normalizedDocPath = normalizeDocPath(docPath);
  if (!normalizedDocPath || !versionId) return false;
  return flattenNavigation(getNavigationForVersion(versionId))
    .some((item) => normalizeDocPath(item.path) === normalizedDocPath);
}

function resolveVersionSwitchHref(version, docPath = CURRENT_ROUTE?.docPath) {
  if (docPath && isPublishedDocPath(docPath, version.id)) {
    return buildVersionedPath(docPath, version);
  }
  return getVersionHomeHref(version);
}

function buildSidebar(items, currentPath) {
  const list = document.createElement('ul');

  items.forEach((item) => {
    if (item.children) {
      const title = document.createElement('li');
      title.className = 'section-title';
      title.textContent = item.title;
      list.appendChild(title);

      item.children.forEach((child) => {
        const entry = document.createElement('li');
        const link = document.createElement('a');
        const childHref = buildVersionedPath(child.path, CURRENT_VERSION);
        link.href = childHref;
        link.textContent = child.title;
        if (childHref === currentPath) link.classList.add('active');
        entry.appendChild(link);
        list.appendChild(entry);
      });
      return;
    }

    const entry = document.createElement('li');
    const link = document.createElement('a');
    const itemHref = buildVersionedPath(item.path, CURRENT_VERSION);
    link.href = itemHref;
    link.textContent = item.title;
    if (itemHref === currentPath) link.classList.add('active');
    entry.appendChild(link);
    list.appendChild(entry);
  });

  return list;
}

function rebuildSidebar(currentPath = getCanonicalPath(CURRENT_ROUTE), { resetScroll = false } = {}) {
  if (!sidebarScrollEl) return;
  sidebarScrollEl.innerHTML = '';
  sidebarScrollEl.appendChild(buildSidebar(SIDEBAR, currentPath));
  if (resetScroll) {
    sidebarScrollEl.scrollTop = 0;
  }
}

function updateSidebarActiveState(currentPath) {
  document.querySelectorAll('.sidebar-scroll a').forEach((link) => {
    const href = normalizePathname(new URL(link.href, location.origin).pathname);
    link.classList.toggle('active', href === currentPath);
  });
}

function ensureActiveSidebarItemVisible() {
  if (!sidebarScrollEl) return;

  const active = sidebarScrollEl.querySelector('a.active');
  if (!active) return;

  const activeTop = active.offsetTop;
  const activeBottom = activeTop + active.offsetHeight;
  const viewportTop = sidebarScrollEl.scrollTop;
  const viewportBottom = viewportTop + sidebarScrollEl.clientHeight;

  if (activeTop < viewportTop || activeBottom > viewportBottom) {
    active.scrollIntoView({ block: 'center' });
  }
}

function renderHomePage() {
  const lanes = [
    {
      number: '01',
      title: 'Foundations',
      description: 'Install Triva, understand the application shape, and get the first server up without ceremony.',
      links: [
        { title: 'Getting started', path: getVersionHomeDocPath(CURRENT_VERSION) },
        { title: 'Installation', path: '/installation' },
        { title: 'First server', path: '/quick-start/first-server' }
      ]
    },
    {
      number: '02',
      title: 'Build',
      description: 'Move through routing, request parsing, responses, middleware, and the runtime model in the order they matter.',
      links: [
        { title: 'Routing', path: '/core/routing' },
        { title: 'Request', path: '/core/request' },
        { title: 'Middleware', path: '/middleware/overview' }
      ]
    },
    {
      number: '03',
      title: 'Ship',
      description: 'Configure adapters, HTTPS, throttle policy, and production behavior without bouncing between unrelated pages.',
      links: [
        { title: 'Database overview', path: '/database/overview' },
        { title: 'Production', path: '/deployment/production' },
        { title: 'Benchmarks', path: '/benchmarks' }
      ]
    }
  ].map((lane) => {
    const links = lane.links.map((link) => `
      <a href="${buildVersionedPath(link.path, CURRENT_VERSION)}">${escapeHtml(link.title)}</a>
    `).join('');

    return `
      <article class="doc-home-lane">
        <div class="doc-home-lane-number">${escapeHtml(lane.number)}</div>
        <h3>${escapeHtml(lane.title)}</h3>
        <p>${escapeHtml(lane.description)}</p>
        <div class="doc-home-lane-links">${links}</div>
      </article>
    `;
  }).join('');

  const mapRows = [
    {
      title: 'Core runtime',
      description: 'Routes, request parsing, response helpers, middleware flow, and error handling.',
      links: [
        { title: 'API reference', path: '/core/api' },
        { title: 'Configuration', path: '/core/configuration' },
        { title: 'Concepts', path: '/core/concepts' }
      ]
    },
    {
      title: 'Middleware',
      description: 'Throttle policy, log retention, custom handlers, CORS, and runtime error capture.',
      links: [
        { title: 'Overview', path: '/middleware/overview' },
        { title: 'Throttling', path: '/middleware/throttling' },
        { title: 'Error tracking', path: '/middleware/error-tracking' }
      ]
    },
    {
      title: 'Data layer',
      description: 'Cache adapters, TTL behavior, memory mode, and the shape shared across external backends.',
      links: [
        { title: 'Adapters', path: '/database/adapters' },
        { title: 'Redis', path: '/database/redis' },
        { title: 'PostgreSQL', path: '/database/postgresql' }
      ]
    },
    {
      title: 'Examples',
      description: 'Runnable patterns for REST APIs, caching, authentication, file handling, and production setups.',
      links: [
        { title: 'REST API', path: '/examples/rest-api' },
        { title: 'Caching', path: '/examples/caching' },
        { title: 'Production ready', path: '/examples/production-ready' }
      ]
    },
    {
      title: 'Deployment and tooling',
      description: 'HTTPS, production behavior, extension packages, and the docs workspace itself.',
      links: [
        { title: 'HTTPS', path: '/deployment/https' },
        { title: 'Extensions', path: '/extensions/overview' },
        { title: 'Docs workspace', path: '/README' }
      ]
    }
  ].map((row) => {
    const links = row.links.map((link) => `
      <a href="${buildVersionedPath(link.path, CURRENT_VERSION)}">${escapeHtml(link.title)}</a>
    `).join('');

    return `
      <article class="doc-home-map-row">
        <div class="doc-home-map-title">
          <h3>${escapeHtml(row.title)}</h3>
        </div>
        <p>${escapeHtml(row.description)}</p>
        <div class="doc-home-map-links">${links}</div>
      </article>
    `;
  }).join('');

  const finalLinks = [
    { title: 'Get started', path: getVersionHomeDocPath(CURRENT_VERSION), featured: true },
    { title: 'First server', path: '/quick-start/first-server' },
    { title: 'REST API', path: '/examples/rest-api' },
    { title: 'Production', path: '/deployment/production' },
    { title: 'Support', path: '/issues' }
  ].map((link) => `
    <a class="doc-home-final-link${link.featured ? ' featured' : ''}" href="${buildVersionedPath(link.path, CURRENT_VERSION)}">${escapeHtml(link.title)}</a>
  `).join('');

  return `
    <div class="doc-home doc-home-landing">
      <section class="doc-home-poster">
        <div class="doc-home-poster-grid">
          <div class="doc-home-copy">
            <div class="doc-home-poster-label">
              <span class="doc-home-brand-tag">Triva</span>
              <span class="doc-home-context">Documentation</span>
              <span class="doc-home-context">${escapeHtml(getVersionLabel(CURRENT_VERSION))}</span>
              <span class="doc-home-context">${escapeHtml(getVersionStatusLabel(CURRENT_VERSION))}</span>
            </div>
            <h1>
              <span>Triva Docs</span>
              <em>Ship the server.</em>
            </h1>
            <p class="doc-home-lead">Reference, guides, adapters, and production patterns for the class-based Node.js framework built around <code>new build(...)</code>.</p>
            <div class="doc-home-actions">
              <a class="doc-home-action-primary" href="${getVersionStartHref(CURRENT_VERSION)}">Get started</a>
              <a class="doc-home-action-secondary" href="${buildVersionedPath('/core/api', CURRENT_VERSION)}">API reference</a>
              <a class="doc-home-action-secondary" href="${buildVersionedPath('/examples/rest-api', CURRENT_VERSION)}">Working examples</a>
            </div>
            <div class="doc-home-install-band">
              <span class="doc-home-install-label">Install</span>
              <code>npm install triva</code>
              <span class="doc-home-install-meta">Node 18+</span>
            </div>
            <div class="doc-home-proof">
              <span>Routing</span>
              <span>Middleware</span>
              <span>Cache adapters</span>
              <span>HTTPS</span>
            </div>
          </div>

          <figure class="doc-home-stage" aria-label="Triva example">
            <div class="doc-home-stage-note">
              <span>Current runtime shape</span>
              <p>Landing-page examples stay aligned with the actual Triva API instead of drifting into docs-only abstractions.</p>
            </div>
            <div class="doc-home-stage-halo" aria-hidden="true"></div>
            <div class="doc-home-code-shell">
              <div class="doc-home-code-top" aria-hidden="true">
                <div class="doc-home-code-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="doc-home-code-file">app.js</div>
              </div>
              <pre class="doc-home-code"><code><span class="token-keyword">import</span> { build } <span class="token-keyword">from</span> <span class="token-string">'triva'</span>;

<span class="token-keyword">const</span> app = <span class="token-keyword">new</span> build({ env: <span class="token-string">'development'</span> });
<span class="token-keyword">const</span> users = [{ id: <span class="token-number">1</span>, name: <span class="token-string">'Ada'</span> }];

app.get(<span class="token-string">'/api/users'</span>, (req, res) => {
  res.json(users);
});

app.get(<span class="token-string">'/api/users/:id'</span>, (req, res) => {
  <span class="token-keyword">const</span> user = users.find((entry) => entry.id === Number(req.params.id));
  <span class="token-keyword">if</span> (!user) <span class="token-keyword">return</span> res.status(<span class="token-number">404</span>).json({ error: <span class="token-string">'User not found'</span> });
  res.json(user);
});

app.listen(<span class="token-number">3000</span>);</code></pre>
            </div>
          </figure>
        </div>
      </section>

      <section class="doc-home-flow">
        <div class="doc-home-section-head">
          <span class="doc-home-section-kicker">Start clean</span>
          <h2>Read it in the order you build it.</h2>
        </div>
        <div class="doc-home-lane-grid">${lanes}</div>
      </section>

      <section class="doc-home-map">
        <div class="doc-home-section-head">
          <span class="doc-home-section-kicker">Browse by concern</span>
          <h2>Everything important stays one jump away.</h2>
        </div>
        <div class="doc-home-map-list">${mapRows}</div>
      </section>

      <section class="doc-home-final">
        <div class="doc-home-final-copy">
          <span class="doc-home-section-kicker">Jump in</span>
          <h2>Open the path you actually need.</h2>
        </div>
        <div class="doc-home-final-links">${finalLinks}</div>
      </section>
    </div>
  `;
}

function renderNotFound(routePath) {
  const suggestions = flattenNavigation(SIDEBAR).slice(0, 6).map((item) => `
    <li><a href="${buildVersionedPath(item.path, CURRENT_VERSION)}">${item.title}</a></li>
  `).join('');

  return `
    <div class="doc-home">
      <h1>Document Not Found</h1>
      <p>The page <code>${escapeHtml(routePath || '/')}</code> is not published for ${escapeHtml(getVersionLabel(CURRENT_VERSION))}.</p>
      <h2>Try one of these pages</h2>
      <ul>${suggestions}</ul>
    </div>
  `;
}

function normalizeContentLinks() {
  document.querySelectorAll('#content a[href]').forEach((anchor) => {
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#')) return;

    try {
      const url = new URL(rawHref, location.origin);
      const isDocsHost = url.hostname === 'docs.trivajs.com';
      const isLocalHost = url.origin === location.origin;
      const isAssetPath = url.pathname.startsWith('/assets/');
      const isFileAsset = /\.(css|js|json|png|jpg|jpeg|gif|svg|webp|ico|pdf|txt|xml)$/i.test(url.pathname);

      if ((isDocsHost || isLocalHost) && !isAssetPath && !isFileAsset) {
        const targetRoute = parseLinkedRoute(url.pathname.replace(/\.md$/i, '') || '/');
        const targetVersion = targetRoute.version || CURRENT_VERSION;
        const targetHref = targetRoute.docPath
          ? buildVersionedPath(targetRoute.docPath, targetVersion)
          : getVersionHomeHref(targetVersion);

        anchor.href = `${targetHref}${url.hash}`;
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
      } else if (!isLocalHost) {
        anchor.target = '_blank';
        anchor.rel = 'noreferrer';
      }
    } catch (error) {
      console.error('Failed to normalize link:', rawHref, error);
    }
  });
}

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

function ensureHeadingIds() {
  document.querySelectorAll('#content h1, #content h2, #content h3').forEach((heading) => {
    if (!heading.id) {
      heading.id = slugify(heading.textContent);
    }
  });
}

function setDocumentTitle() {
  const title = document.querySelector('#content h1')?.textContent?.trim();
  const docsLabel = `Triva Docs ${getVersionLabel(CURRENT_VERSION)}`;
  document.title = title ? `${title} - ${docsLabel}` : docsLabel;
}

function buildTableOfContents() {
  const toc = document.querySelector('.toc');
  const tocNav = document.querySelector('.toc-nav');
  if (!toc || !tocNav) return;

  if (tocObserver) {
    tocObserver.disconnect();
    tocObserver = null;
  }

  tocNav.innerHTML = '';

  if (document.body.classList.contains('docs-home-route')) {
    toc.style.display = 'none';
    return;
  }

  const headings = Array.from(document.querySelectorAll('#content h2, #content h3'));

  if (!headings.length) {
    toc.style.display = 'none';
    return;
  }

  toc.style.display = 'block';

  headings.forEach((heading) => {
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    link.dataset.level = heading.tagName.toLowerCase() === 'h3' ? '3' : '2';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState({
        ...(history.state || {}),
        scrollY: window.scrollY,
        sidebarScrollTop: sidebarScrollEl?.scrollTop || 0
      }, '', `${location.pathname}${location.search}#${heading.id}`);
    });
    tocNav.appendChild(link);
  });

  setupScrollSpy();
}

function setupScrollSpy() {
  const links = document.querySelectorAll('.toc-nav a');
  if (!links.length) return;

  tocObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-100px 0px -66%' });

  document.querySelectorAll('#content h2, #content h3').forEach((heading) => {
    tocObserver.observe(heading);
  });
}

function getPrevNext(currentDocPath = CURRENT_ROUTE?.docPath) {
  const flat = flattenNavigation(SIDEBAR);
  const normalizedDocPath = normalizeDocPath(currentDocPath);
  const index = flat.findIndex((item) => normalizeDocPath(item.path) === normalizedDocPath);

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index !== -1 && index < flat.length - 1 ? flat[index + 1] : null
  };
}

function addPrevNextNavigation() {
  if (!CURRENT_ROUTE?.docPath) return;

  const content = document.getElementById('content');
  if (!content) return;

  const { prev, next } = getPrevNext(CURRENT_ROUTE.docPath);
  if (!prev && !next) return;

  const nav = document.createElement('div');
  nav.className = 'page-navigation';

  const prevButton = document.createElement('a');
  prevButton.className = prev ? 'nav-button prev' : 'nav-button prev disabled';
  prevButton.href = prev ? buildVersionedPath(prev.path, CURRENT_VERSION) : '#';
  prevButton.innerHTML = `
    <div class="nav-label">Previous Page</div>
    <div class="nav-title">${prev ? prev.title : 'No previous page'}</div>
  `;

  const nextButton = document.createElement('a');
  nextButton.className = next ? 'nav-button next' : 'nav-button next disabled';
  nextButton.href = next ? buildVersionedPath(next.path, CURRENT_VERSION) : '#';
  nextButton.innerHTML = `
    <div class="nav-label">Next Page</div>
    <div class="nav-title">${next ? next.title : 'No next page'}</div>
  `;

  nav.appendChild(prevButton);
  nav.appendChild(nextButton);
  content.appendChild(nav);
}

function initMobileSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !overlay || !sidebar) return;

  const close = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  };

  const open = () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('sidebar-open');
  };

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      close();
    } else {
      open();
    }
  });

  overlay.addEventListener('click', close);
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) {
      close();
    }
  });
}

function initVersionSwitcher() {
  versionToggleEl = document.getElementById('versionToggle');
  versionMenuEl = document.getElementById('versionMenu');
  docsHomeLinkEl = document.getElementById('docsHomeLink');

  if (!versionToggleEl || !versionMenuEl) return;

  const closeMenu = () => {
    versionMenuEl.hidden = true;
    versionToggleEl.setAttribute('aria-expanded', 'false');
  };

  versionToggleEl.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = versionMenuEl.hidden;
    versionMenuEl.hidden = !willOpen;
    versionToggleEl.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (event) => {
    if (versionMenuEl.hidden) return;
    if (versionMenuEl.contains(event.target) || versionToggleEl.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
}

function renderVersionSwitcher() {
  if (!versionToggleEl || !versionMenuEl || !CURRENT_VERSION) return;

  const badge = document.getElementById('versionBadge');
  const meta = document.getElementById('versionMeta');

  if (badge) badge.textContent = getVersionLabel(CURRENT_VERSION);
  if (meta) meta.textContent = getVersionStatusLabel(CURRENT_VERSION);

  const versionItems = DOCS_CONFIG.versions.map((version) => {
    const href = resolveVersionSwitchHref(version);
    const isCurrent = version.id === CURRENT_VERSION.id;

    return `
      <a class="version-option${isCurrent ? ' current' : ''}" href="${href}">
        <span class="version-option-copy">
          <span class="version-option-title">${escapeHtml(getVersionLabel(version))}</span>
          <span class="version-option-subtitle">${escapeHtml(getVersionDescription(version))}</span>
        </span>
        <span class="version-option-indicator">${isCurrent ? 'Current' : getVersionStatusLabel(version)}</span>
      </a>
    `;
  }).join('');

  const emptyState = DOCS_CONFIG.versions.length < 2
    ? '<div class="version-empty">More releases will appear here.</div>'
    : '';

  versionMenuEl.innerHTML = `${versionItems}${emptyState}`;
  versionMenuEl.hidden = true;
  versionToggleEl.setAttribute('aria-expanded', 'false');

  if (docsHomeLinkEl) {
    docsHomeLinkEl.href = getVersionHomeHref(CURRENT_VERSION);
    docsHomeLinkEl.setAttribute('aria-label', `Go to ${getVersionLabel(CURRENT_VERSION)} documentation home`);
  }
}

function scrollToHash() {
  if (!location.hash) return false;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return false;

  setTimeout(() => {
    target.scrollIntoView({ block: 'start' });
  }, 0);

  return true;
}

function applyScrollState(mode = 'preserve', historyState = null) {
  if (scrollToHash()) return;

  if (mode === 'history' && historyState && typeof historyState.scrollY === 'number') {
    window.scrollTo({ top: historyState.scrollY, left: 0 });
    return;
  }

  if (mode === 'top') {
    window.scrollTo({ top: 0, left: 0 });
  }
}

function saveViewState() {
  const currentState = history.state || {};
  history.replaceState({
    ...currentState,
    scrollY: window.scrollY,
    sidebarScrollTop: sidebarScrollEl?.scrollTop || 0
  }, '', location.href);
}

function restoreSidebarState(historyState = null) {
  if (!sidebarScrollEl || !historyState || typeof historyState.sidebarScrollTop !== 'number') return;
  sidebarScrollEl.scrollTop = historyState.sidebarScrollTop;
}

function isClientNavigationLink(anchor) {
  const rawHref = anchor.getAttribute('href');
  if (!rawHref || rawHref.startsWith('#')) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  let url;
  try {
    url = new URL(anchor.href, location.origin);
  } catch (error) {
    return false;
  }

  if (!/^https?:$/.test(url.protocol)) return false;
  if (url.origin !== location.origin) return false;
  if (url.pathname.startsWith('/assets/')) return false;
  if (/\.(css|js|json|png|jpg|jpeg|gif|svg|webp|ico|pdf|txt|xml)$/i.test(url.pathname)) return false;

  return true;
}

function syncRouteState({ forceSidebarRebuild = false } = {}) {
  const previousVersionId = CURRENT_VERSION?.id;
  CURRENT_ROUTE = parseRoute();

  if (shouldCanonicalizeRoute(CURRENT_ROUTE)) {
    history.replaceState({
      ...(history.state || {}),
      scrollY: window.scrollY,
      sidebarScrollTop: sidebarScrollEl?.scrollTop || 0
    }, '', `${getCanonicalPath(CURRENT_ROUTE)}${location.search}${location.hash}`);
    CURRENT_ROUTE = parseRoute();
  }

  CURRENT_VERSION = CURRENT_ROUTE.version || getDefaultVersion() || DOCS_CONFIG?.versions?.[0] || DEFAULT_VERSIONS_CONFIG.versions[0];
  SIDEBAR = getNavigationForVersion(CURRENT_VERSION?.id);
  renderVersionSwitcher();

  const currentPath = getCanonicalPath(CURRENT_ROUTE);
  const shouldRebuildSidebar = forceSidebarRebuild || previousVersionId !== CURRENT_VERSION?.id || !sidebarScrollEl?.querySelector('ul');

  if (shouldRebuildSidebar) {
    rebuildSidebar(currentPath, { resetScroll: previousVersionId !== CURRENT_VERSION?.id });
  } else {
    updateSidebarActiveState(currentPath);
  }
}

async function navigateTo(url, { replace = false } = {}) {
  const target = typeof url === 'string' ? new URL(url, location.origin) : url;
  const nextPath = normalizePathname(target.pathname);
  const nextHref = `${target.pathname || '/'}${target.search}${target.hash}`;
  const currentPath = getCurrentPath();
  const historyMethod = replace ? 'replaceState' : 'pushState';

  saveViewState();

  if (nextPath === currentPath) {
    history[historyMethod]({
      scrollY: 0,
      sidebarScrollTop: sidebarScrollEl?.scrollTop || 0
    }, '', nextHref);
    applyScrollState(target.hash ? 'preserve' : 'top');
    return;
  }

  history[historyMethod]({
    scrollY: 0,
    sidebarScrollTop: sidebarScrollEl?.scrollTop || 0
  }, '', nextHref);

  await loadMarkdown({ scrollMode: 'top' });
}

function initClientNavigation() {
  document.addEventListener('click', async (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!isClientNavigationLink(anchor)) return;

    event.preventDefault();
    await navigateTo(new URL(anchor.href, location.origin));
  });

  window.addEventListener('popstate', async (event) => {
    await loadMarkdown({ scrollMode: 'history', historyState: event.state });
  });
}

async function loadMarkdown({ scrollMode = 'preserve', historyState = null } = {}) {
  const content = document.getElementById('content');
  if (!content) return;

  syncRouteState();
  const isHomeRoute = !CURRENT_ROUTE?.docPath;
  document.body.classList.toggle('docs-home-route', isHomeRoute);

  if (isHomeRoute) {
    content.innerHTML = renderHomePage();
    normalizeContentLinks();
    buildTableOfContents();
    setDocumentTitle();
    restoreSidebarState(historyState);
    applyScrollState(scrollMode, historyState);
    return;
  }

  if (!isPublishedDocPath(CURRENT_ROUTE.docPath, CURRENT_VERSION.id)) {
    content.innerHTML = renderNotFound(getCanonicalPath(CURRENT_ROUTE));
    normalizeContentLinks();
    buildTableOfContents();
    setDocumentTitle();
    restoreSidebarState(historyState);
    applyScrollState(scrollMode, historyState);
    return;
  }

  try {
    const mdPath = buildMarkdownPath(CURRENT_ROUTE.docPath, CURRENT_VERSION);
    const response = await fetch(mdPath);
    if (!response.ok) throw new Error(`404: ${mdPath}`);
    const markdown = await response.text();

    content.innerHTML = marked.parse(markdown, {
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false
    });

    ensureHeadingIds();
    normalizeContentLinks();
    highlightCode();
    addCopyButtons();
    addPrevNextNavigation();
    buildTableOfContents();
    setDocumentTitle();
    restoreSidebarState(historyState);
    applyScrollState(scrollMode, historyState);
  } catch (error) {
    console.error(error);
    content.innerHTML = renderNotFound(getCanonicalPath(CURRENT_ROUTE));
    normalizeContentLinks();
    buildTableOfContents();
    setDocumentTitle();
    restoreSidebarState(historyState);
    applyScrollState(scrollMode, historyState);
  }
}

async function init() {
  const loaded = await loadConfig();
  if (!loaded) return;

  sidebarScrollEl = document.querySelector('.sidebar-scroll');
  if (!sidebarScrollEl) return;

  initVersionSwitcher();
  syncRouteState({ forceSidebarRebuild: true });
  initMobileSidebar();
  initClientNavigation();

  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }

  await loadMarkdown();
  ensureActiveSidebarItemVisible();

  history.replaceState({
    ...(history.state || {}),
    scrollY: window.scrollY,
    sidebarScrollTop: sidebarScrollEl.scrollTop
  }, '', location.href);
}

init();
