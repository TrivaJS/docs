// Sidebar structure
const SIDEBAR = [
  { title: 'Getting Started', path: '/getting-started' },
  { title: 'Installation', path: '/installation' },
  {
    title: 'Database & Cache',
    children: [
      { title: 'Overview', path: '/database-and-cache/overview' }
    ]
  }
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
  { title: 'Terms of Use', path: '/terms' },
  { title: 'Privacy Policy', path: '/privacy' },
  { title: 'Security Policy', path: '/security' },
  { title: 'Code of Conduct', path: '/code-of-conduct' },
  { title: 'Funding', path: '/funding' },
  { title: 'Contributing', path: '/contributing' }
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

      if (
        item.children.some(
          c =>
            c.path === currentPath ||
            (c.children && c.children.some(sc => sc.path === currentPath))
        )
      ) {
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
