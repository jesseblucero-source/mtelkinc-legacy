// Page-scoped product discovery. Selections live in shareable URLs, never in customer storage.
const clean = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function initPage() {
  const root = document.querySelector('main.catalog-page');
  const data = root?.querySelector('[data-catalog-tools]');
  if (!data || root.dataset.catalogBound) return;
  let config;
  try { config = JSON.parse(data.textContent); } catch { return; }
  root.dataset.catalogBound = 'true';
  const {copy: c, lang, products} = config;
  const names = new Map(products.map(p => [String(p.id), p.name]));
  const prefix = lang === 'en' ? '' : '/' + lang;
  const filter = root.querySelector('[data-catalog-filters]');
  const comparisonForm = root.querySelector('[data-compare-form]');
  const results = root.querySelector('[data-comparison-results]');
  const feedback = root.querySelector('[data-compare-feedback]');
  let selected = [], shareSequence = 0;
  const parseSelection = raw => {
    const tokens = String(raw || '').slice(0, 200).split(',').filter(Boolean);
    return {ids: [...new Set(tokens.filter(id => /^\d+$/.test(id) && names.has(id)))].slice(0, 3), invalid: tokens.some(id => !names.has(id)) || new Set(tokens).size > 3};
  };
  const selectionURL = (path, absolute = false) => {
    const url = new URL(path, absolute ? 'https://www.mtelkinc.com' : location.origin);
    if (selected.length) url.searchParams.set('compare', selected.join(','));
    else url.searchParams.delete('compare');
    return absolute ? url.href : url.pathname + url.search + url.hash;
  };
  const say = text => { if (feedback) feedback.textContent = text; };
  function decorateLinks() {
    const links = [...root.querySelectorAll('a[href]'), ...document.querySelectorAll('[data-site-language][href]')];
    for (const a of links) {
      const url = new URL(a.getAttribute('href'), location.href);
      if (!/^(?:\/(?:fr|es|de))?\/catalog\//.test(url.pathname)) continue;
      a.setAttribute('href', selectionURL(url.pathname + url.search + url.hash));
    }
  }
  function renderSelection() {
    for (const input of root.querySelectorAll('[data-compare-product]')) {
      input.closest('label').hidden = false;
      input.checked = selected.includes(input.value);
    }
    const rail = root.querySelector('[data-compare-rail]');
    if (rail) {
      rail.hidden = false;
      rail.querySelector('[data-compare-count]').textContent = c.selected.replace('{count}', selected.length);
      const chips = rail.querySelector('[data-compare-chips]');
      chips.replaceChildren();
      for (const id of selected) {
        const li = document.createElement('li'), button = document.createElement('button');
        button.type = 'button'; button.dataset.compareRemove = id;
        button.textContent = names.get(id) + ' ×';
        button.setAttribute('aria-label', c.remove + ': ' + names.get(id));
        li.append(button); chips.append(li);
      }
    }
    for (const button of root.querySelectorAll('[data-compare-clear]')) button.disabled = !selected.length;
    decorateLinks();
  }
  function renderComparison() {
    if (!comparisonForm) return;
    comparisonForm.hidden = false;
    [...comparisonForm.querySelectorAll('select')].forEach((input, i) => { input.value = selected[i] || ''; });
    results.replaceChildren();
    for (const id of selected) {
      const template = root.querySelector('template[data-compare-template="' + id + '"]');
      if (template) results.append(template.content.cloneNode(true));
    }
    results.style.setProperty('--comparison-columns', Math.max(1, selected.length));
    root.querySelector('[data-comparison-empty]').hidden = !!selected.length;
    const share = root.querySelector('[data-comparison-share]');
    share.hidden = !selected.length;
    share.querySelector('[data-compare-share]').hidden = typeof navigator.share !== 'function';
    share.querySelector('[data-compare-share-status]').textContent = '';
    share.querySelector('[data-compare-manual]').hidden = true;
    share.querySelector('[data-compare-url]').value = selectionURL(prefix + '/catalog/compare/', true);
    shareSequence++;
  }
  function renderFilters() {
    if (!filter) return;
    const params = new URLSearchParams(location.search);
    const q = (params.get('q') || '').trim().slice(0, 100);
    const category = params.get('category') ?? filter.dataset.baseCategory ?? '';
    filter.elements.q.value = q;
    filter.elements.category.value = [...filter.elements.category.options].some(o => o.value === category) ? category : '';
    const tokens = clean(q).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of root.querySelectorAll('[data-catalog-product]')) {
      const text = clean(card.dataset.search || card.dataset.name);
      const show = tokens.every(token => text.includes(token)) && (!filter.elements.category.value || card.dataset.categories.split(' ').includes(filter.elements.category.value));
      card.hidden = !show; if (show) count++;
    }
    root.querySelector('[data-catalog-status]').textContent = count + ' ' + filter.dataset.count;
    root.querySelector('[data-catalog-empty]').hidden = count !== 0;
  }
  function render() {
    if (!root.isConnected) return;
    const parsed = parseSelection(new URLSearchParams(location.search).get('compare'));
    selected = parsed.ids;
    renderFilters(); renderComparison(); renderSelection();
    say(parsed.invalid ? c.invalid : '');
  }
  function changeSelection(ids, push = false) {
    selected = [...new Set(ids.filter(id => names.has(id)))].slice(0, 3);
    const url = selectionURL(location.pathname + location.search + location.hash);
    history[push ? 'pushState' : 'replaceState'](history.state, '', url);
    render();
  }
  root.addEventListener('change', event => {
    const input = event.target.closest('[data-compare-product]');
    if (!input) return;
    if (input.checked && selected.length === 3 && !selected.includes(input.value)) {
      input.checked = false; say(c.limit); return;
    }
    changeSelection(input.checked ? [...selected, input.value] : selected.filter(id => id !== input.value));
  });
  root.addEventListener('click', event => {
    const remove = event.target.closest('[data-compare-remove]');
    const clear = event.target.closest('[data-compare-clear]');
    if (!remove && !clear) return;
    const wasComparison = !!comparisonForm;
    const removedIndex = remove ? selected.indexOf(remove.dataset.compareRemove) : 0;
    changeSelection(clear ? [] : selected.filter(id => id !== remove.dataset.compareRemove), wasComparison);
    if (wasComparison) {
      const headings = results.querySelectorAll('h2');
      const target = headings[Math.min(removedIndex, headings.length - 1)] || root.querySelector('[data-comparison-empty] h2');
      target.tabIndex = -1; target.focus();
    } else if (remove) {
      const rail = root.querySelector('[data-compare-rail]');
      (rail.querySelector('[data-compare-remove]') || rail.querySelector('a')).focus({preventScroll: true});
    }
  });
  filter?.addEventListener('submit', event => {
    event.preventDefault();
    const url = new URL(location.href), q = filter.elements.q.value.trim().slice(0, 100), category = filter.elements.category.value;
    url.searchParams.delete('q'); url.searchParams.delete('category');
    if (q) url.searchParams.set('q', q);
    if (category || filter.dataset.baseCategory) url.searchParams.set('category', category);
    history.pushState(history.state, '', url); render();
  });
  comparisonForm?.addEventListener('submit', event => {
    event.preventDefault();
    changeSelection([...comparisonForm.querySelectorAll('select')].map(input => input.value).filter(Boolean), true);
  });
  const share = root.querySelector('[data-comparison-share]');
  if (share) {
    const status = share.querySelector('[data-compare-share-status]');
    const manual = () => {
      share.querySelector('[data-compare-manual]').hidden = false;
      const input = share.querySelector('[data-compare-url]'); input.focus(); input.select(); status.textContent = c.manual;
    };
    share.querySelector('[data-compare-copy]').addEventListener('click', async () => {
      const sequence = shareSequence, url = selectionURL(prefix + '/catalog/compare/', true);
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Unavailable');
        await navigator.clipboard.writeText(url);
        if (root.isConnected && sequence === shareSequence) status.textContent = c.copied;
      } catch { if (root.isConnected && sequence === shareSequence) manual(); }
    });
    share.querySelector('[data-compare-share]').addEventListener('click', async () => {
      const sequence = shareSequence;
      try {
        await navigator.share({title: c.compare + ' | MT E.L.K., INC.', url: selectionURL(prefix + '/catalog/compare/', true)});
        if (root.isConnected && sequence === shareSequence) status.textContent = c.shared;
      } catch (error) {
        if (!root.isConnected || sequence !== shareSequence) return;
        if (error.name === 'AbortError') status.textContent = c.cancelled;
        else manual();
      }
    });
  }
  window.addEventListener('popstate', render);
  render();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.MTPageRouter ? MTPageRouter.run(initPage) : initPage(), {once: true});
else window.MTPageRouter ? MTPageRouter.run(initPage) : initPage();
