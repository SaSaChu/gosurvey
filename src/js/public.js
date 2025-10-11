$(function () {
  // 啟用 Bootstrap Tooltips
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    new bootstrap.Tooltip(el, { boundary: document.body, placement: 'right' });
  });

  // ===== 側欄展開/收合（沿用） =====
  const $layout = $('#appLayout');
  const SIDEBAR_KEY = 'admin_sidebar_collapsed';
  const remembered = localStorage.getItem(SIDEBAR_KEY);
  if (remembered === '1' || (!remembered && window.innerWidth < 1366)) {
    $layout.addClass('is-collapsed');
  }
  $('#toggleSidebar').on('click', function () {
    $layout.toggleClass('is-collapsed');
    localStorage.setItem(SIDEBAR_KEY, $layout.hasClass('is-collapsed') ? '1' : '0');
  });

  // 側欄 active 狀態（示例）
  $('.menu').on('click', '.nav-item:not(.is-disabled) .nav-link', function (e) {
    e.preventDefault();
    $('.menu .nav-item').removeClass('is-active');
    $(this).closest('.nav-item').addClass('is-active');
    // TODO: 這裡接路由或載入內容
  });

  // ===== 通知抽屜 =====
  const $drawer = $('#notifDrawer');
  const $backdrop = $('#notifBackdrop');
  const $openBtn = $('.js-open-notif');
  const $closeBtn = $('.js-close-notif');
  const $markAllBtn = $('.js-mark-all');
  const $badgeTop = $('.notif-count');
  const $badgeHdr = $('.js-unread-badge');

  function unreadCount() {
    return $drawer.find('.notif-item.is-unread').length;
  }
  function syncBadges() {
    const n = unreadCount();
    if (n > 0) {
      $badgeTop.text(n).show();
      $badgeHdr.text(n + ' 則未讀').removeClass('bg-secondary').addClass('bg-danger');
    } else {
      $badgeTop.hide();
      $badgeHdr.text('全部已讀').removeClass('bg-danger').addClass('bg-secondary');
    }
  }
  function openDrawer() {
    $drawer.addClass('is-open').attr('aria-hidden', 'false');
    $backdrop.removeAttr('hidden').addClass('is-show');
    $('body').addClass('overflow-hidden');
  }
  function closeDrawer() {
    $drawer.removeClass('is-open').attr('aria-hidden', 'true');
    $backdrop.removeClass('is-show').attr('hidden', true);
    $('body').removeClass('overflow-hidden');
  }

  $openBtn.on('click', function (e) { e.preventDefault(); openDrawer(); });
  $closeBtn.on('click', function () { closeDrawer(); });
  $backdrop.on('click', function () { closeDrawer(); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  // 單筆已讀
  $drawer.on('click', '.js-mark-read', function (e) {
    e.preventDefault();
    $(this).closest('.notif-item').removeClass('is-unread');
    syncBadges();
  });

  // 全部已讀
  $markAllBtn.on('click', function () {
    $drawer.find('.notif-item').removeClass('is-unread');
    syncBadges();
  });

  // 初始化徽章
  syncBadges();
});


$(function () {
  // 1) 把 label 文字塞進 tooltip（只做一次）
  function prepareSidebarTitles() {
    $('.sidebar .menu .nav-link').each(function () {
      const $link = $(this);
      // 如果沒有 title，就用 label 文字補上
      if (!$link.attr('title') && !$link.attr('data-bs-original-title')) {
        const txt = $.trim($link.find('.label').text());
        if (txt) $link.attr('title', txt);
      }
      // 統一提示方向與容器
      $link.attr('data-bs-toggle', 'tooltip')
           .attr('data-bs-placement', 'right')
           .attr('data-bs-container', 'body');
    });
  }

  // 2) 初始化或刷新 tooltip（在展開/收合切換時呼叫）
  function refreshSidebarTooltips() {
    // 先銷毀舊的，再重建（避免重複）
    $('.sidebar .menu .nav-link').each(function () {
      const t = bootstrap.Tooltip.getInstance(this);
      if (t) t.dispose();
      new bootstrap.Tooltip(this, {
        boundary: document.body,
        trigger: 'hover focus',
        placement: 'right',
        container: 'body'
      });
    });
  }

  // 3) 僅在「收合狀態」顯示 tooltip；展開時可選擇關掉（較乾淨）
  function toggleTooltipsBySidebarState() {
    const collapsed = $('#appLayout').hasClass('is-collapsed');
    $('.sidebar .menu .nav-link').each(function () {
      const inst = bootstrap.Tooltip.getInstance(this);
      if (!inst) return;
      if (collapsed) inst.enable();
      else inst.disable();
    });
  }

  // 一開始執行
  prepareSidebarTitles();
  refreshSidebarTooltips();
  toggleTooltipsBySidebarState();

  // 你的原本側欄記憶（沿用）
  const $layout = $('#appLayout');
  const SIDEBAR_KEY = 'admin_sidebar_collapsed';
  const remembered = localStorage.getItem(SIDEBAR_KEY);
  if (remembered === '1' || (!remembered && window.innerWidth < 1366)) {
    $layout.addClass('is-collapsed');
  }
  // 切換側欄：記憶 + tooltip 狀態同步
  $('#toggleSidebar').on('click', function () {
    $layout.toggleClass('is-collapsed');
    localStorage.setItem(SIDEBAR_KEY, $layout.hasClass('is-collapsed') ? '1' : '0');
    // 展開/收合後刷新與開關 tooltip
    refreshSidebarTooltips();
    toggleTooltipsBySidebarState();
  });

  // 禁用項目：阻擋點擊但允許 tooltip
  $('.sidebar').on('click', '.menu .is-disabled .nav-link', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
});
