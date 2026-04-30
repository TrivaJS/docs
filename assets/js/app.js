lucide.createIcons();

let SIDEBAR = [];
let sidebarScrollEl = null;
let tocObserver = null;

const COPY_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';

function normalizePathname(pathname = '/') {
  return pathname.replace(/\/+$/, '');
}

function getCurrentPath() {
  return normalizePathname(location.pathname);
}

function getMarkdownPath(pathname = getCurrentPath()) {
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  if (!normalized) return null;
  return `/${normalized}.md`;
}

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
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
    const response = await fetch('/assets/data/navigation.json');
    const navData = await response.json();
    SIDEBAR = navData.navigation || [];
    return true;
  } catch (error) {
    console.error('Failed to load navigation:', error);
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
        link.href = child.path;
        link.textContent = child.title;
        if (child.path === currentPath) link.classList.add('active');
        entry.appendChild(link);
        list.appendChild(entry);
      });
      return;
    }

    const entry = document.createElement('li');
    const link = document.createElement('a');
    link.href = item.path;
    link.textContent = item.title;
    if (item.path === currentPath) link.classList.add('active');
    entry.appendChild(link);
    list.appendChild(entry);
  });

  return list;
}

function updateSidebarActiveState(currentPath) {
  document.querySelectorAll('.sidebar a').forEach((link) => {
    const href = normalizePathname(link.getAttribute('href') || '');
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
  const sections = SIDEBAR.map((section) => {
    const items = (section.children || []).map((child) => `
      <li><a href="${child.path}">${child.title}</a></li>
    `).join('');

    return `
      <section class="doc-section">
        <h2>${section.title}</h2>
        <ul>${items}</ul>
      </section>
    `;
  }).join('');

  return `
    <div class="doc-home">
      <h1>Triva Documentation</h1>
      <p>Browse the full docs set from one place, including guides, examples, extensions, deployment notes, and project policies.</p>
      <div class="doc-home-actions">
        <a href="/getting-started">Start with Getting Started</a>
        <a href="/quick-start/first-server">Build Your First Server</a>
        <a href="/issues">Get Support</a>
      </div>
      <div class="doc-grid">${sections}</div>
    </div>
  `;
}

function renderNotFound(mdPath) {
  const suggestions = flattenNavigation(SIDEBAR).slice(0, 6).map((item) => `
    <li><a href="${item.path}">${item.title}</a></li>
  `).join('');

  return `
    <div class="doc-home">
      <h1>Document Not Found</h1>
      <p>The route <code>${escapeHtml(mdPath)}</code> does not map to a published Markdown page.</p>
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

      if (isDocsHost || isLocalHost) {
        const pathname = url.pathname.replace(/\.md$/i, '') || '/';
        anchor.href = `${pathname}${url.hash}`;
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
      } else {
        anchor.target = '_blank';
        anchor.rel = 'noreferrer';
      }
    } catch (error) {
      console.error('Failed to normalize link:', rawHref, error);
    }
  });
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
  document.title = title ? `${title} - Triva Docs` : 'Triva Docs';
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
      history.replaceState(null, '', `#${heading.id}`);
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

function getPrevNext(currentPath) {
  const flat = flattenNavigation(SIDEBAR);
  const index = flat.findIndex((item) => item.path === currentPath);

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index !== -1 && index < flat.length - 1 ? flat[index + 1] : null
  };
}

function addPrevNextNavigation() {
  const currentPath = getCurrentPath();
  if (!currentPath) return;

  const content = document.getElementById('content');
  if (!content) return;

  const { prev, next } = getPrevNext(currentPath);
  if (!prev && !next) return;

  const nav = document.createElement('div');
  nav.className = 'page-navigation';

  const prevButton = document.createElement('a');
  prevButton.className = prev ? 'nav-button prev' : 'nav-button prev disabled';
  prevButton.href = prev ? prev.path : '#';
  prevButton.innerHTML = `
    <div class="nav-label">Previous Page</div>
    <div class="nav-title">${prev ? prev.title : 'No previous page'}</div>
  `;

  const nextButton = document.createElement('a');
  nextButton.className = next ? 'nav-button next' : 'nav-button next disabled';
  nextButton.href = next ? next.path : '#';
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

  document.querySelectorAll('.sidebar a').forEach((link) => {
    link.addEventListener('click', close);
  });
}

function scrollToHash() {
  if (!location.hash) return;
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
  const mdPath = getMarkdownPath();

  if (!content) return;

  updateSidebarActiveState(getCurrentPath());

  if (!mdPath) {
    content.innerHTML = renderHomePage();
    setDocumentTitle();
    buildTableOfContents();
    restoreSidebarState(historyState);
    applyScrollState(scrollMode, historyState);
    return;
  }

  try {
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
    content.innerHTML = renderNotFound(mdPath);
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

  const currentPath = getCurrentPath();
  sidebarScrollEl.appendChild(buildSidebar(SIDEBAR, currentPath));
  updateSidebarActiveState(currentPath);
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
