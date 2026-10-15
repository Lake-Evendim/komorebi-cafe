const groups = [
  { id: 'street', title: '街角', views: [
    ['corner','街角全景','樱花、坡道，与一间安静的喫茶店。'],
    ['detail','店面近看','木框窗与暖帘，迎接经过的人。'],
    ['roof','屋檐与樱枝','抬头看，春天落在青色屋瓦上。'],
    ['roadside','街边一隅','沿着路缘，看看小店周围。'],
    ['rear','店后的风景','绕过街角，发现另一面的日常。'],
  ]},
  { id: 'entrance', title: '门前', views: [
    ['garden','门口植物','水生植物与多肉，错落生长。'],
    ['water','一盆春水','睡莲、浮叶，与水面的细小涟漪。'],
    ['parking','自行车停靠','把自行车停好，再进去坐坐。'],
    ['umbrellas','入口雨具','窗边留着两把伞，等下一场雨。'],
  ]},
  { id: 'room', title: '店内', views: [
    ['inside','喫茶店内','推开门，走进胡桃木色的空间。'],
    ['booth','窗边卡座','柔软的座位，和一束斜照的日光。'],
    ['artwork','墙上的画','枯山水与咖啡，为日常留白。'],
    ['reading','书柜一角','在靠墙的位置，翻几页书。'],
  ]},
  { id: 'bar', title: '吧台', views: [
    ['equipment','咖啡器物','看一杯咖啡开始的地方。'],
    ['grinders','磨豆与压粉','豆粒、磨豆机，和吧台上的准备。'],
    ['cakes','今日甜点','六款小小的甜点，等待被选择。'],
    ['workflow','后吧台','制作、备料与交付，各有位置。'],
    ['coffee','今日咖啡','从店里的菜单，挑一杯喜欢的。'],
  ]},
];
export const viewCatalog = groups.flatMap(group => group.views.map(([id,title,description]) => ({id,title,description,group:group.id,category:group.title})));

const icons = {
  pause: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="m9 5 10 7-10 7Z"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="2.5" fill="currentColor" stroke="none"/>',
  chevronLeft: '<path d="m14 6-6 6 6 6"/>',
  chevronRight: '<path d="m10 6 6 6-6 6"/>',
  chevronUp: '<path d="m6 14 6-6 6 6"/>',
  grid: '<rect x="4" y="4" width="5" height="5" rx="1"/><rect x="15" y="4" width="5" height="5" rx="1"/><rect x="4" y="15" width="5" height="5" rx="1"/><rect x="15" y="15" width="5" height="5" rx="1"/>',
  frame: '<path d="M8 4H4v4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>',
  camera: '<path d="M8 6 9.5 4h5L16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  reset: '<path d="M4 11a8 8 0 1 1 2 6M4 5v6h6"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
};
const element = id => document.getElementById(id);

export function createInterface({ onSelect, onStep, onReset }) {
  let current = viewCatalog[0], selectedGroup = current.group;
  document.querySelectorAll('[data-icon]').forEach(node => {
    node.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[node.dataset.icon] + '</svg>';
  });

  element('viewTabs').innerHTML = groups.map(group =>
    '<button type="button" role="tab" id="tab-' + group.id + '" data-group="' + group.id + '" aria-controls="viewList" aria-selected="false" tabindex="-1">' + group.title + '</button>'
  ).join('');

  const renderGroup = groupId => {
    selectedGroup = groupId;
    element('viewTabs').querySelectorAll('[role="tab"]').forEach(tab => {
      const active = tab.dataset.group === groupId;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    element('viewList').setAttribute('aria-labelledby','tab-' + groupId);
    element('viewList').innerHTML = viewCatalog.filter(view => view.group === groupId).map(view => {
      const number = String(viewCatalog.indexOf(view) + 1).padStart(2,'0');
      return '<button class="view-card" data-shot="' + view.id + '" aria-pressed="' + (view.id === current.id) + '"><span class="view-card-number">' + number + '</span><strong>' + view.title + '</strong><small>' + view.description + '</small><span class="view-card-mark" aria-hidden="true"></span></button>';
    }).join('');
  };

  function connectPanel(dialogId, triggerId, closeId) {
    const panel = element(dialogId), trigger = element(triggerId);
    trigger.addEventListener('click', () => {
      if(panel.open) panel.close();
      else {
        if(dialogId === 'shotPicker') renderGroup(current.group);
        panel.showModal();
        trigger.setAttribute('aria-expanded','true');
      }
    });
    element(closeId).addEventListener('click', () => panel.close());
    panel.addEventListener('close', () => trigger.setAttribute('aria-expanded','false'));
  }
  connectPanel('shotPicker','openViews','closeViews');
  connectPanel('preferences','settings','closeSettings');
  document.querySelectorAll('dialog').forEach(panel => panel.addEventListener('click', event => {
    const bounds = panel.getBoundingClientRect();
    if(event.target === panel && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) panel.close();
  }));

  element('viewTabs').addEventListener('click', event => {
    const tab = event.target.closest('[data-group]');
    if(tab) renderGroup(tab.dataset.group);
  });
  element('viewTabs').addEventListener('keydown', event => {
    const tab = event.target.closest('[role="tab"]');
    if(!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const tabs = [...element('viewTabs').children], index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    renderGroup(tabs[next].dataset.group); tabs[next].focus();
  });
  element('viewList').addEventListener('click', event => {
    const button = event.target.closest('[data-shot]');
    if(!button) return;
    onSelect(button.dataset.shot);
    element('shotPicker').close();
  });
  element('previousView').addEventListener('click', () => onStep(-1));
  element('nextView').addEventListener('click', () => onStep(1));
  element('resetView').addEventListener('click', () => { onReset(); element('preferences').close(); });
  window.addEventListener('keydown', event => {
    if(event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]') || document.body.classList.contains('clean') || event.target.closest('input,select,textarea')) return;
    if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); onStep(event.key === 'ArrowRight' ? 1 : -1); }
  });
  renderGroup(selectedGroup);

  return {
    update(name) {
      current = viewCatalog.find(view => view.id === name) ?? current;
      element('viewCategory').textContent = current.category;
      element('viewNumber').textContent = String(viewCatalog.indexOf(current) + 1).padStart(2,'0') + ' / ' + viewCatalog.length;
      element('viewTitle').textContent = current.title;
      element('viewDescription').textContent = current.description;
      element('currentViewLabel').textContent = current.title;
      element('captureCaption').textContent = current.title + ' · 木漏れ日';
      element('announcement').textContent = '当前取景：' + current.title;
      renderGroup(current.group);
    },
    closePanels() { document.querySelectorAll('dialog[open]').forEach(panel => panel.close()); },
  };
}
