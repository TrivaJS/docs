// SVG Icons
lucide.createIcons();

let SIDEBAR = [];
let QUICK_LINKS = [];
let COPYRIGHT = '';
const manuallyExpandedFolders = new Set();

// ═══════════════════════════════════════════════════════════════════════════
// Configuration Loading
// ═══════════════════════════════════════════════════════════════════════════

async function loadConfig() {
  try {
    const [navResponse] = await Promise.all([
      fetch('/assets/data/navigation.json'),
    ]);
    const navData = await navResponse.json();
    SIDEBAR = navData.navigation;
    return true;
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SVG Icons
// ═══════════════════════════════════════════════════════════════════════════
const ARROW_SVG = '<svg class="arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const COPY_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

function getMarkdownPath() {
  let path = location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path) return null;
  return `/${path}.md`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ═══════════════════════════════════════════════════════════════════════════
// Syntax Highlighting
// ═══════════════════════════════════════════════════════════════════════════

function highlightJavaScript(code) {
  const tokens = [];
  const text = code;
  let pos = 0;

  while (pos < text.length) {
    let matched = false;

    if (text.substr(pos, 2) === '//') {
      const end = text.indexOf('\n', pos);
      const comment = end === -1 ? text.substr(pos) : text.substring(pos, end);
      tokens.push({ type: 'comment', value: comment });
      pos += comment.length;
      matched = true;
    }
    else if (text.substr(pos, 2) === '/*') {
      const end = text.indexOf('*/', pos + 2);
      const comment = end === -1 ? text.substr(pos) : text.substring(pos, end + 2);
      tokens.push({ type: 'comment', value: comment });
      pos += comment.length;
      matched = true;
    }
    else if (text[pos] === '"' || text[pos] === "'" || text[pos] === '`') {
      const quote = text[pos];
      let end = pos + 1;
      while (end < text.length) {
        if (text[end] === '\\') { end += 2; continue; }
        if (text[end] === quote) { end++; break; }
        end++;
      }
      const str = text.substring(pos, end);
      tokens.push({ type: 'string', value: str });
      pos = end;
      matched = true;
    }
    else if (/\d/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /[\d.]/.test(text[end])) end++;
      tokens.push({ type: 'number', value: text.substring(pos, end) });
      pos = end;
      matched = true;
    }
    else if (/[a-zA-Z_$]/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /[a-zA-Z0-9_$]/.test(text[end])) end++;
      const word = text.substring(pos, end);

      if (/^(const|let|var|function|async|await|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|from|default|static|get|set|typeof|instanceof|delete|void|yield|this|super|in|of)$/.test(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (/^(true|false|null|undefined|NaN|Infinity)$/.test(word)) {
        tokens.push({ type: 'boolean', value: word });
      } else {
        let nextNonSpace = end;
        while (nextNonSpace < text.length && /\s/.test(text[nextNonSpace])) nextNonSpace++;
        if (text[nextNonSpace] === '(') {
          tokens.push({ type: 'function', value: word });
        } else {
          tokens.push({ type: 'text', value: word });
        }
      }
      pos = end;
      matched = true;
    }

    if (!matched) {
      tokens.push({ type: 'text', value: text[pos] });
      pos++;
    }
  }

  return tokens.map(t => {
    const escaped = escapeHtml(t.value);
    if (t.type === 'text') return escaped;
    return `<span class="token-${t.type}">${escaped}</span>`;
  }).join('');
}

function highlightBash(code) {
  const tokens = [];
  const text = code;
  let pos = 0;

  while (pos < text.length) {
    let matched = false;

    if (text[pos] === '#') {
      const end = text.indexOf('\n', pos);
      const comment = end === -1 ? text.substr(pos) : text.substring(pos, end);
      tokens.push({ type: 'comment', value: comment });
      pos += comment.length;
      matched = true;
    }
    else if (text[pos] === '"' || text[pos] === "'") {
      const quote = text[pos];
      let end = pos + 1;
      while (end < text.length) {
        if (text[end] === '\\') { end += 2; continue; }
        if (text[end] === quote) { end++; break; }
        end++;
      }
      tokens.push({ type: 'string', value: text.substring(pos, end) });
      pos = end;
      matched = true;
    }
    else if (/\d/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /\d/.test(text[end])) end++;
      tokens.push({ type: 'number', value: text.substring(pos, end) });
      pos = end;
      matched = true;
    }
    else if (/[a-zA-Z_]/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /[a-zA-Z0-9_-]/.test(text[end])) end++;
      const word = text.substring(pos, end);

      if (/^(npm|node|git|cd|ls|mkdir|rm|cp|mv|chmod|chown|grep|sed|awk|cat|echo|curl|wget|tar|sudo|apt|brew|if|then|else|fi|for|while|do|done)$/.test(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      pos = end;
      matched = true;
    }
    else if (text[pos] === '-' && text[pos + 1] === '-') {
      let end = pos + 2;
      while (end < text.length && /[a-zA-Z0-9-]/.test(text[end])) end++;
      tokens.push({ type: 'property', value: text.substring(pos, end) });
      pos = end;
      matched = true;
    }
    else if (text[pos] === '-' && /[a-zA-Z]/.test(text[pos + 1])) {
      let end = pos + 1;
      while (end < text.length && /[a-zA-Z0-9]/.test(text[end])) end++;
      tokens.push({ type: 'property', value: text.substring(pos, end) });
      pos = end;
      matched = true;
    }

    if (!matched) {
      tokens.push({ type: 'text', value: text[pos] });
      pos++;
    }
  }

  return tokens.map(t => {
    const escaped = escapeHtml(t.value);
    if (t.type === 'text') return escaped;
    return `<span class="token-${t.type}">${escaped}</span>`;
  }).join('');
}

function highlightJSON(code) {
  const tokens = [];
  const text = code;
  let pos = 0;

  while (pos < text.length) {
    let matched = false;

    if (text[pos] === '"') {
      let end = pos + 1;
      while (end < text.length) {
        if (text[end] === '\\') { end += 2; continue; }
        if (text[end] === '"') { end++; break; }
        end++;
      }
      const str = text.substring(pos, end);

      let nextNonSpace = end;
      while (nextNonSpace < text.length && /\s/.test(text[nextNonSpace])) nextNonSpace++;

      if (text[nextNonSpace] === ':') {
        tokens.push({ type: 'property', value: str });
      } else {
        tokens.push({ type: 'string', value: str });
      }
      pos = end;
      matched = true;
    }
    else if (/\d/.test(text[pos]) || (text[pos] === '-' && /\d/.test(text[pos + 1]))) {
      let end = pos;
      if (text[end] === '-') end++;
      while (end < text.length && /[\d.]/.test(text[end])) end++;
      tokens.push({ type: 'number', value: text.substring(pos, end) });
      pos = end;
      matched = true;
    }
    else if (/[a-z]/.test(text[pos])) {
      let end = pos;
      while (end < text.length && /[a-z]/.test(text[end])) end++;
      const word = text.substring(pos, end);
      if (/^(true|false|null)$/.test(word)) {
        tokens.push({ type: 'boolean', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      pos = end;
      matched = true;
    }

    if (!matched) {
      tokens.push({ type: 'text', value: text[pos] });
      pos++;
    }
  }

  return tokens.map(t => {
    const escaped = escapeHtml(t.value);
    if (t.type === 'text') return escaped;
    return `<span class="token-${t.type}">${escaped}</span>`;
  }).join('');
}

function highlightHTML(code) {
  return escapeHtml(code);
}

function highlightCSS(code) {
  return escapeHtml(code);
}

function highlightYAML(code) {
  return escapeHtml(code);
}

function highlightCode() {
  document.querySelectorAll('pre code').forEach((block) => {
    const language = (block.className.match(/language-(\w+)/) || [])[1] || 'javascript';
    const code = block.textContent;
    let highlighted;

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'jsx':
      case 'typescript':
      case 'ts':
        highlighted = highlightJavaScript(code);
        break;
      case 'bash':
      case 'sh':
      case 'shell':
        highlighted = highlightBash(code);
        break;
      case 'json':
        highlighted = highlightJSON(code);
        break;
      case 'html':
      case 'xml':
        highlighted = highlightHTML(code);
        break;
      case 'css':
      case 'scss':
        highlighted = highlightCSS(code);
        break;
      case 'yaml':
      case 'yml':
        highlighted = highlightYAML(code);
        break;
      default:
        highlighted = escapeHtml(code);
    }

    block.innerHTML = highlighted;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Copy Buttons
// ═══════════════════════════════════════════════════════════════════════════

function addCopyButtons() {
  document.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.copy-button')) return;
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = COPY_SVG;
    button.title = 'Copy code';
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(code);
        button.innerHTML = CHECK_SVG;
        button.classList.add('copied');
        setTimeout(() => {
          button.innerHTML = COPY_SVG;
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
    pre.appendChild(button);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Table of Contents (Right Sidebar)
// ═══════════════════════════════════════════════════════════════════════════

function buildTableOfContents() {
  const tocNav = document.querySelector('.toc-nav');
  if (!tocNav) return;

  tocNav.innerHTML = '';

  // Extract h1 and h2 headings from the content
  const headings = document.querySelectorAll('#content h2');

  if (headings.length === 0) {
    document.querySelector('.toc').style.display = 'none';
    return;
  }

  document.querySelector('.toc').style.display = 'block';

  headings.forEach(heading => {
    const level = heading.tagName.toLowerCase() === 'h2' ? '2' : '3';
    const text = heading.textContent.trim();
    const id = heading.id || text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    if (!heading.id) heading.id = id;

    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = text;
    link.setAttribute('data-level', level);
    link.addEventListener('click', (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    });

    tocNav.appendChild(link);
  });

  // Scroll spy: highlight active section
  setupScrollSpy();
}

function setupScrollSpy() {
  const tocLinks = document.querySelectorAll('.toc-nav a');
  if (tocLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { rootMargin: '-100px 0px -66%' }
  );

  document.querySelectorAll('#content h2').forEach(heading => {
    observer.observe(heading);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Markdown Loading
// ═══════════════════════════════════════════════════════════════════════════

async function loadMarkdown() {
  const content = document.getElementById('content');
  const mdPath = getMarkdownPath();

  if (!mdPath) {
    content.innerHTML = '<h1>Welcome to Triva Documentation</h1><p>Select a document from the sidebar.</p>';
    buildTableOfContents();
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

    // Ensure all headings have IDs for TOC linking
    document.querySelectorAll('#content h1, #content h2, #content h3').forEach(h => {
      if (!h.id) {
        h.id = h.textContent.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      }
    });

    highlightCode();
    addCopyButtons();
    buildTableOfContents();
    addPrevNextNavigation();

  } catch (err) {
    console.error(err);
    content.innerHTML = '<h1>404</h1><p>Document not found.</p>';
    buildTableOfContents();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Sidebar Navigation
// ═══════════════════════════════════════════════════════════════════════════

function hasActiveChild(item, currentPath) {
  if (item.path === currentPath) return true;
  if (!item.children) return false;
  return item.children.some(child => hasActiveChild(child, currentPath));
}

function getFolderId(item, parentPath = '') {
  return `${parentPath}/${item.title}`.replace(/\s+/g, '-').toLowerCase();
}

function buildSidebar(items, currentPath, parentPath = '') {
  const ul = document.createElement('ul');

  items.forEach(item => {
    if (item.children) {
      // Section title (not clickable, always visible)
      const titleLi = document.createElement('li');
      titleLi.className = 'section-title';
      titleLi.textContent = item.title;
      ul.appendChild(titleLi);

      // Children (always visible, no collapsing)
      item.children.forEach(child => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = child.path;
        link.textContent = child.title;
        if (child.path === currentPath) link.classList.add('active');
        li.appendChild(link);
        ul.appendChild(li);
      });
    } else {
      // Top-level link
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.path;
      link.textContent = item.title;
      if (item.path === currentPath) link.classList.add('active');
      li.appendChild(link);
      ul.appendChild(li);
    }
  });

  return ul;
}

// ═══════════════════════════════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════════════════════════════

async function init() {
  const configLoaded = await loadConfig();
  if (!configLoaded) return;

  const sidebarScroll = document.querySelector('.sidebar-scroll');
  const sidebar = document.getElementById('sidebar');
  const currentPath = location.pathname.replace(/\/$/, '');

  if (!sidebarScroll || !sidebar) return;

  sidebarScroll.appendChild(buildSidebar(SIDEBAR, currentPath));

  await loadMarkdown();

  // Scroll active item into view
  const active = document.querySelector('.sidebar a.active');
  if (active && sidebarScroll) {
    setTimeout(() => {
      sidebarScroll.scrollTop = active.offsetTop - sidebarScroll.offsetHeight / 2;
    }, 100);
  }
}

init();

// Add GitHub SVG
const GITHUB_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>';

// Flatten navigation for prev/next
function flattenNavigation(items) {
  const flat = [];
  function traverse(items) {
    items.forEach(item => {
      if (item.path) flat.push(item);
      if (item.children) traverse(item.children);
    });
  }
  traverse(items);
  return flat;
}

function getPrevNext(currentPath) {
  const flat = flattenNavigation(SIDEBAR);
  const currentIndex = flat.findIndex(item => item.path === currentPath);
  return {
    prev: currentIndex > 0 ? flat[currentIndex - 1] : null,
    next: currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null
  };
}

function addPrevNextNavigation() {
  const currentPath = location.pathname.replace(/\/$/, '');
  const { prev, next } = getPrevNext(currentPath);
  const navContainer = document.createElement('div');
  navContainer.className = 'page-navigation';
  const prevButton = document.createElement('a');
  prevButton.className = prev ? 'nav-button prev' : 'nav-button prev disabled';
  if (prev) prevButton.href = prev.path;
  prevButton.innerHTML = `
    <div class="nav-label">Previous Page</div>
    <div class="nav-title">${prev ? prev.title : 'No previous page'}</div>
  `;
  const nextButton = document.createElement('a');
  nextButton.className = next ? 'nav-button next' : 'nav-button next disabled';
  if (next) nextButton.href = next.path;
  nextButton.innerHTML = `
    <div class="nav-label">Next Page</div>
    <div class="nav-title">${next ? next.title : 'No next page'}</div>
  `;
  navContainer.appendChild(prevButton);
  navContainer.appendChild(nextButton);
  const content = document.getElementById('content');
  content.appendChild(navContainer);
}
