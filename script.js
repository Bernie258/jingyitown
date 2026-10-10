/* ============================================================
   静怡镇官网共享模板脚本
   作用：在各页面中注入共享的"导航"与"页脚"，避免每页重复编写；
        并按当前所在页面，高亮对应的导航链接。
   用法：每个页面只需留 <nav id="site-nav"></nav> 与
        <footer id="site-footer"></footer> 两个占位元素即可。
   ============================================================ */

// 站点导航项：路径与显示名
const NAV_ITEMS = [
  { href: 'index.html', label: '首页' },
  { href: 'about.html', label: '建筑' },
  { href: 'story.html', label: '故事' },
  { href: 'contact.html', label: '联系我们' },
];

// 建筑图片清单：建筑随镇子发展逐日增多，新增建筑只需在此追加路径即可
// 建议图片为透明背景 PNG，底部对齐地平线自动拼接
const BUILDINGS = [
  // 例如：'images/station.png',
  // 例如：'images/warehouse.png',
];

// 取当前页面文件名，本地直接打开时为空则视为首页
function currentPageName() {
  const path = window.location.pathname.split('/').pop();
  return path === '' ? 'index.html' : path;
}

// 注入导航：高亮当前页对应的链接
function renderNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const current = currentPageName();
  const items = NAV_ITEMS.map((item) => {
    // 当前页对应的链接加 active 类
    const active = item.href === current ? ' class="active"' : '';
    return `<li><a href="${item.href}"${active}>${item.label}</a></li>`;
  }).join('');
  nav.innerHTML = `<ul class="nav-list">${items}</ul>`;
}

// 注入页脚
function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  // 年份自动取当前年份
  footer.innerHTML = `
    <div class="footer-inner">
      <p class="footer-title">静怡镇</p>
      <p class="footer-sub">静揽沧波 · 怡居仙岛</p>
      <p class="footer-copy">© ${new Date().getFullYear()} 静怡镇 · 凌洲铁路服务器</p>
    </div>
  `;
}

// 按真实时间计算当前时段：早 / 午 / 晚 / 夜
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'dawn';   // 早上 5-10
  if (h >= 10 && h < 16) return 'day';   // 中午 10-16
  if (h >= 16 && h < 20) return 'dusk';   // 傍晚 16-20
  return 'night';                         // 夜晚 20-5
}

// 注入顶部天际线横幅：天空 + 海面 + 草地岛 + 接入桥梁 + 建筑群
// 时段由真实时间决定；同时给 body 加 data-time 供暗色模式使用
function renderBanner() {
  const bannerEl = document.getElementById('site-banner');
  if (!bannerEl) return;
  // 计算时段：横幅和 body 都用同一个
  const tod = getTimeOfDay();
  // 给 body 加 data-time，供 CSS 变量覆盖实现暗色模式
  document.body.setAttribute('data-time', tod);
  // 建筑图片逐栋拼接
  const buildingsHTML = BUILDINGS.map((src) =>
    `<img class="building" src="${src}" alt="静怡镇建筑">`
  ).join('');
  bannerEl.innerHTML = `
    <div class="skyline-banner" data-time="${tod}">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="water"></div>
      <div class="island"></div>
      <div class="bridge"></div>
      <div class="buildings">${buildingsHTML}</div>
    </div>
  `;
}

// 滚动折叠：向下滚动超过阈值时天际线缩为色条，回滚则恢复
// 使用 passive: true + requestAnimationFrame 节流，避免卡顿
function initScrollCollapse() {
  const THRESHOLD = 60;          // 滚动超过 60px 触发折叠
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const banner = document.querySelector('.skyline-banner');
      if (banner) {
        banner.classList.toggle('collapsed', window.scrollY > THRESHOLD);
      }
      ticking = false;
    });
  }, { passive: true });
}

// 注入 MC 服务器状态图：服务器地址做了 base64 编码，源码中不暴露明文
// mcstatus.io widget 接口实时返回一张状态图片
function injectMcStatus() {
  const img = document.getElementById('mc-status-img');
  if (!img) return;
  // base64 解码得到服务器地址，避免明文出现在源码中
  const serverAddr = atob('cGxheS5zaW1wZnVuLmNuOjI4NjY3');
  img.src = `https://api.mcstatus.io/v2/widget/java/${serverAddr}?dark=true`;
}

// DOM 就绪后注入共享组件
document.addEventListener('DOMContentLoaded', () => {
  renderBanner();
  renderNav();
  renderFooter();
  initScrollCollapse();
  injectMcStatus();
});
