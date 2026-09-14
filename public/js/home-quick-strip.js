// 快捷栏：搜索框下方展示「固定书签 + 最近点击」
// - 固定书签：后台设置（home_quick_pins），由 SSR 按访客可见性过滤后注入 IORI_QUICK_PINS
// - 最近点击：仅记录在当前浏览器 localStorage，不经过服务端
(function () {
  const STORE_KEY = 'iori_quick_recents';
  const MAX_STORED = 12;
  const MAX_PINS = 2;
  const MAX_RECENTS = 3;

  // IORI_SITES / IORI_QUICK_PINS 由页尾内联脚本注入，晚于本文件执行，
  // 因此在函数内延迟读取，不能在顶层捕获
  function getAllSites() {
    return Array.isArray(window.IORI_SITES) ? window.IORI_SITES : [];
  }

  function getPins() {
    return Array.isArray(window.IORI_QUICK_PINS) ? window.IORI_QUICK_PINS : [];
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  function loadRecentIds() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecentIds(ids) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(ids.slice(0, MAX_STORED)));
    } catch (e) { /* 隐私模式等场景下静默失败 */ }
  }

  function recordClick(id) {
    if (id === undefined || id === null || id === '') return;
    const ids = loadRecentIds().filter((v) => String(v) !== String(id));
    ids.unshift(id);
    saveRecentIds(ids);
    render();
  }

  function findSiteById(id) {
    return getAllSites().find((site) => String(site.id) === String(id));
  }

  // IORI_SITES 的对象会被卡片脚本改写成 nameHtml/urlHtml 等卡片模型字段，
  // 这里兼容原始字段与卡片字段两种形态；*Html 已转义，直接使用不再转义
  function pickField(site, rawName, htmlName) {
    if (site[rawName] !== undefined && site[rawName] !== null && site[rawName] !== '') {
      return escapeHTML(String(site[rawName]));
    }
    if (site[htmlName] !== undefined && site[htmlName] !== null && site[htmlName] !== '') {
      return String(site[htmlName]);
    }
    return '';
  }

  function itemHtml(site, extraClass) {
    const name = pickField(site, 'name', 'nameHtml') || '?';
    const url = pickField(site, 'url', 'urlHtml') || '#';
    const logo = pickField(site, 'logo', 'logoUrlHtml');
    const desc = pickField(site, 'desc', 'descHtml');
    const icon = logo
      ? `<img src="${logo}" class="quick-strip-icon" alt="" loading="lazy">`
      : `<span class="quick-strip-icon quick-strip-letter">${escapeHTML(String(name).slice(0, 1).toUpperCase())}</span>`;
    return `<a class="quick-strip-item ${extraClass}" data-site-id="${escapeHTML(site.id)}" href="${url}" target="_blank" rel="noopener noreferrer" title="${desc || name}">${icon}<span class="quick-strip-name">${name}</span></a>`;
  }

  function render() {
    const strip = document.getElementById('quickStrip');
    if (!strip) return;

    const pins = getPins();
    const pinIds = new Set(pins.map((site) => String(site.id)));
    const recentSites = loadRecentIds()
      .map(findSiteById)
      .filter(Boolean)
      .filter((site) => !pinIds.has(String(site.id)))
      .slice(0, MAX_RECENTS);

    const parts = [];
    const pinItems = pins.slice(0, MAX_PINS);
    pinItems.forEach((site) => parts.push(itemHtml(site, 'is-pin')));
    // 固定与最近之间加竖线分隔
    if (pinItems.length > 0 && recentSites.length > 0) {
      parts.push('<span class="quick-strip-divider" aria-hidden="true"></span>');
    }
    recentSites.forEach((site) => parts.push(itemHtml(site, 'is-recent')));

    if (parts.length === 0) {
      strip.innerHTML = '';
      strip.classList.add('hidden');
      return;
    }
    strip.innerHTML = parts.join('');
    strip.classList.remove('hidden');
  }

  function init() {
    // 事件委托：卡片由 SSR / 前端切换分类时动态渲染，统一在 document 上捕获
    document.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const card = event.target.closest('#sitesGrid [data-id]');
      if (card) {
        recordClick(card.getAttribute('data-id'));
        return;
      }
      const stripItem = event.target.closest('#quickStrip [data-site-id]');
      if (stripItem) {
        recordClick(stripItem.getAttribute('data-site-id'));
      }
    }, true);

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
