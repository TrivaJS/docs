let SIDEBAR = [];
let QUICK_LINKS = [];
let COPYRIGHT = '';
const manuallyExpandedFolders = new Set();

async function loadConfig() {
  try {
    const [navResponse, footerResponse] = await Promise.all([
      fetch('/assets/data/navigation.json'),
      fetch('/assets/data/footer.json')
    ]);
    const navData = await navResponse.json();
    const footerData = await footerResponse.json();
    SIDEBAR = navData.navigation;
    QUICK_LINKS = footerData.quickLinks;
    COPYRIGHT = footerData.copyright;
    return true;
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return false;
  }
}

const ARROW_SVG = '<svg class="arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const COPY_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';

function getMarkdownPath() {
  let path = location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path) return null;
  return `/${path.toLowerCase()}.md`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

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

async function loadMarkdown() {
  const content = document.getElementById('content');
  const mdPath = getMarkdownPath();
  if (!mdPath) {
    content.innerHTML = '<h1>Welcome to Triva Documentation</h1><p>Select a document from the sidebar.</p>';
    return;
  }
  try {
    const res = await fetch(mdPath);
    if (!res.ok) throw new Error(`404: ${mdPath}`);
    const md = await res.text();
    content.innerHTML = marked.parse(md, { gfm: true, breaks: false, headerIds: true, mangle: false });
    document.querySelectorAll('#content h1, #content h2, #content h3').forEach(h => {
      if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    });
    highlightCode();
    addCopyButtons();
  } catch (err) {
    console.error(err);
    content.innerHTML = '<h1>404</h1><p>Document not found.</p>';
  }
}

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
    const li = document.createElement('li');
    const folderId = getFolderId(item, parentPath);
    if (item.children) {
      const title = document.createElement('div');
      title.className = 'section-title';
      title.innerHTML = `<span>${item.title}</span>${ARROW_SVG}`;
      title.onclick = () => {
        const isExpanded = li.classList.contains('expanded');
        li.classList.toggle('expanded');
        if (!isExpanded) {
          manuallyExpandedFolders.add(folderId);
        } else {
          manuallyExpandedFolders.delete(folderId);
        }
      };
      li.appendChild(title);
      const childUL = buildSidebar(item.children, currentPath, folderId);
      childUL.className = 'sub-items';
      li.appendChild(childUL);
      const hasActive = hasActiveChild(item, currentPath);
      const wasManuallyExpanded = manuallyExpandedFolders.has(folderId);
      if (hasActive || wasManuallyExpanded) {
        li.classList.add('expanded');
        manuallyExpandedFolders.add(folderId);
      }
    } else {
      const link = document.createElement('a');
      link.href = item.path;
      link.textContent = item.title;
      if (item.path === currentPath) link.classList.add('active');
      li.appendChild(link);
    }
    ul.appendChild(li);
  });
  return ul;
}

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

async function init() {
  const configLoaded = await loadConfig();
  if (!configLoaded) return;
  const sidebarScroll = document.querySelector('.sidebar-scroll');
  const sidebar = document.getElementById('sidebar');
  const currentPath = location.pathname.replace(/\/$/, '');
  if (!sidebarScroll || !sidebar) return;
  sidebarScroll.appendChild(buildSidebar(SIDEBAR, currentPath));
  addSidebarFooter(sidebar);
  await loadMarkdown();
  const active = document.querySelector('.sidebar a.active');
  if (active && sidebarScroll) {
    setTimeout(() => {
      sidebarScroll.scrollTop = active.offsetTop - sidebarScroll.offsetHeight / 2;
    }, 100);
  }
}

init();
