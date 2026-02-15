// Sidebar structure
const SIDEBAR = [
  { title: 'Getting Started', path: '/getting-started' },
  { title: 'Installation', path: '/installation' },
  {
    title: 'v1.0.0',
    children: [
      {
        title: 'API Reference',
        children: [
          { title: 'Core API', path: '/v1/api-reference/core-api' },
          { title: 'Build', path: '/v1/api-reference/build' },
          { title: 'Routing', path: '/v1/api-reference/routing' },
          { title: 'Listen', path: '/v1/api-reference/listen' },
          { title: 'Use', path: '/v1/api-reference/use' },
          {
            title: 'Request',
            children: [
              { title: 'Headers', path: '/v1/api-reference/request/headers' },
              { title: 'Query', path: '/v1/api-reference/request/query' },
              { title: 'Params', path: '/v1/api-reference/request/params' },
              { title: 'JSON', path: '/v1/api-reference/request/json' },
              { title: 'Text', path: '/v1/api-reference/request/text' },
            ]
          },
          {
            title: 'Response',
            children: [
              { title: 'Headers', path: '/v1/api-reference/response/headers' },
              { title: 'Query', path: '/v1/api-reference/response/query' },
              { title: 'Params', path: '/v1/api-reference/response/params' },
              { title: 'JSON', path: '/v1/api-reference/response/json' },
              { title: 'Text', path: '/v1/api-reference/response/text' },
            ]
          },
          {
            title: 'Cache',
            children: [
              { title: 'Set', path: '/v1/api-reference/cache/set' },
              { title: 'Get', path: '/v1/api-reference/cache/get' },
              { title: 'Keys', path: '/v1/api-reference/cache/keys' },
              { title: 'Delete', path: '/v1/api-reference/cache/delete' },
              { title: 'Clear', path: '/v1/api-reference/cache/clear' },
            ]
          },
        ]
      },
      {
        title: 'Database & Cache',
        children: [
          { title: 'Overview', path: '/v1/database-and-cache/overview' },
          {
            title: 'Adapters',
            children: [
              { title: 'Supported Adapters', path: '/v1/database-and-cache/adapters/supported-adapters' },
              { title: 'Memory', path: '/v1/database-and-cache/adapters/memory' },
              { title: 'Embedded', path: '/v1/database-and-cache/adapters/embedded' },
              { title: 'MongoDB', path: '/v1/database-and-cache/adapters/mongodb' },
              { title: 'Redis', path: '/v1/database-and-cache/adapters/redis' },
              { title: 'PostgreSQL', path: '/v1/database-and-cache/adapters/postgresql' },
              { title: 'SQLite', path: '/v1/database-and-cache/adapters/sqlite' },
              { title: 'MySQL', path: '/v1/database-and-cache/adapters/mysql' },
              { title: 'Supabase', path: '/v1/database-and-cache/adapters/supabase' },
              { title: 'Better-SQLite3', path: '/v1/database-and-cache/adapters/better-sqlite3' }
            ]
          }
        ]
      },
      {
        title: 'Middleware',
        children: [
          { title: 'Overview', path: '/v1/middleware/overview' },
          { title: 'Best Practices', path: '/v1/middleware/best-practices' },
          { title: 'Middleware Stack', path: '/v1/middleware/middleware-stack' },
          { title: 'Throttling', path: '/v1/middleware/throttling' },
          { title: 'Logging', path: '/v1/middleware/logging' },
          { title: 'Error Tracking', path: '/v1/middleware/error-tracking' },
          { title: 'Cors', path: '/v1/middleware/cors' },
          { title: 'Custom Middleware', path: '/v1/middleware/custom-middleware' },
          { title: 'Auto Redirect', path: '/v1/middleware/auto-redirect' }
        ]
      },
      {
        title: 'Guides',
        children: [
          { title: 'Routing', path: '/v1/guides/routing' },
          { title: 'Deployment', path: '/v1/guides/deployment' },
        ]
      },
      {
        title: 'Examples',
        children: [
          {
            title: 'Basic',
            children: [
              { title: 'Hello World', path: '/v1/examples/basic/hello-world' },
              { title: 'File Upload', path: '/v1/examples/basic/file-upload' },
              { title: 'Authentication', path: '/v1/examples/basic/authentication' },
              { title: 'Rest API', path: '/v1/examples/basic/rest-api' },
            ]
          },
          {
            title: 'Database',
            children: [
              { title: 'MongoDB', path: '/v1/examples/database/mongodb' },
              { title: 'Redis', path: '/v1/examples/database/redis' },
              { title: 'PostgreSQL', path: '/v1/examples/database/postgresql' },
            ]
          },
          {
            title: 'Real-World',
            children: [
              { title: 'Chat', path: '/v1/examples/real-world/chat' },
              { title: 'Ecommerce', path: '/v1/examples/real-world/ecommerce' },
              { title: 'Blog API', path: '/v1/examples/real-world/blog-api' },
            ]
          },
          {
            title: 'Advanced',
            children: [
              { title: 'GraphQL', path: '/v1/examples/advanced/graphql' },
              { title: 'Microservices', path: '/v1/examples/advanced/microservices' },
              { title: 'Rate Limiting', path: '/v1/examples/advanced/rate-limiting' },
              { title: 'Websockets', path: '/v1/examples/advanced/websockets' },
            ]
          },
        ]
      },
      {
        title: 'Extensions',
        children: [
          { title: 'Creating Extensions', path: '/v1/extensions/creating-extensions' },
          { title: 'Publishing Extensions', path: '/v1/extensions/publishing-extensions' },
          {
            title: 'Official Extensions',
            children: [
              { title: 'CORS', path: '/v1/extensions/official/cors' },
              { title: 'CLI', path: '/v1/extensions/official/cli' },
              { title: 'Shortcuts', path: '/v1/extensions/official/shortcuts' },
              { title: 'JWT', path: '/v1/extensions/official/jwt' },
            ]
          },
        ]
      },
    ]
  },
];

// Inline SVG arrow icon
const ARROW_SVG = `
<svg class="arrow" viewBox="0 0 24 24">
  <path d="M9 18l6-6-6-6"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
`;

// Quick links/footer
const QUICK_LINKS = [
  { title: 'Terms of Use', path: '/policies/terms' },
  { title: 'Privacy Policy', path: '/policies/privacy' },
  { title: 'Security Policy', path: '/policies/security' },
  { title: 'Code of Conduct', path: '/policies/code-of-conduct' },
  { title: 'Funding', path: '/policies/funding' },
  { title: 'Contributing', path: '/policies/contributing' }
];

const COPYRIGHT = '© 2026 TrivaJS';

/**
 * Normalize pathname into a markdown file path
 * - removes leading slash
 * - removes trailing slash
 * - lowercases (Cloudflare is case-sensitive)
 */
function getMarkdownPath() {
  let path = location.pathname;

  // Remove leading/trailing slashes
  path = path.replace(/^\/+|\/+$/g, '');

  if (!path) return null;

  // Normalize case for filesystem
  path = path.toLowerCase();

  return `/${path}.md`;
}

// Load Markdown content
async function loadMarkdown() {
  const content = document.getElementById('content');
  const mdPath = getMarkdownPath();

  if (!mdPath) {
    content.innerHTML = '<h1>Select a document</h1>';
    return;
  }

  try {
    const res = await fetch(mdPath);
    if (!res.ok) throw new Error(`404: ${mdPath}`);

    const md = await res.text();

    content.innerHTML = marked.parse(md, {
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false
    });

    applyHeaderIds();
  } catch (err) {
    console.error(err);
    content.innerHTML = '<h1>404</h1><p>Document not found.</p>';
  }
}

// Force predictable IDs for h1 / h2 (TOC FIX)
function applyHeaderIds() {
  document.querySelectorAll('h1, h2').forEach(h => {
    if (!h.id) {
      h.id = h.textContent
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    }
  });
}

// Recursive function to check if any nested child has the active path
function hasActiveChild(item, currentPath) {
  if (item.path === currentPath) return true;
  if (!item.children) return false;
  return item.children.some(child => hasActiveChild(child, currentPath));
}

// Build sidebar recursively
function buildSidebar(items, currentPath) {
  const ul = document.createElement('ul');

  items.forEach(item => {
    const li = document.createElement('li');

    if (item.children) {
      const title = document.createElement('div');
      title.className = 'section-title';
      title.innerHTML = `<span>${item.title}</span>${ARROW_SVG}`;

      title.onclick = () => {
        li.classList.toggle('expanded');
      };

      li.appendChild(title);

      const childUL = buildSidebar(item.children, currentPath);
      childUL.className = 'sub-items';
      li.appendChild(childUL);

      // Use recursive function to check all nested levels
      if (hasActiveChild(item, currentPath)) {
        li.classList.add('expanded');
      }
    } else {
      const link = document.createElement('a');
      link.href = item.path;
      link.textContent = item.title;

      if (item.path === currentPath) {
        link.classList.add('active');
      }

      li.appendChild(link);
    }

    ul.appendChild(li);
  });

  return ul;
}

// Add sidebar footer
function addSidebarFooter(container) {
  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';

  const quickLinksDiv = document.createElement('div');
  quickLinksDiv.className = 'quick-links';

  QUICK_LINKS.forEach(link => {
    const a = document.createElement('a');
    a.href = link.path;
    a.textContent = link.title;
    quickLinksDiv.appendChild(a);
  });

  footer.appendChild(quickLinksDiv);

  const copyrightDiv = document.createElement('div');
  copyrightDiv.className = 'copyright';
  copyrightDiv.textContent = COPYRIGHT;

  footer.appendChild(copyrightDiv);
  container.appendChild(footer);
}

// Auto-scroll sidebar to active page
function scrollToActive() {
  const active = document.querySelector('.sidebar a.active');
  const sidebarScroll = document.querySelector('.sidebar-scroll');

  if (active && sidebarScroll) {
    sidebarScroll.scrollTop =
      active.offsetTop - sidebarScroll.offsetHeight / 2;
  }
}

// Init
(function init() {
  const sidebarScroll = document.querySelector('.sidebar-scroll');
  const sidebar = document.getElementById('sidebar');
  const currentPath = location.pathname.replace(/\/$/, '');

  if (!sidebarScroll || !sidebar) return;

  sidebarScroll.appendChild(buildSidebar(SIDEBAR, currentPath));
  addSidebarFooter(sidebar);

  loadMarkdown().then(scrollToActive);
})();
