/* ==============================
   Bootstrap 初始化（Tooltip）
============================== */
$(function () {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    new bootstrap.Tooltip(el, { boundary: document.body, trigger: 'hover focus' });
  });
});

/* ==============================
   側欄：收合記憶 + Tooltip 行為
============================== */
$(function () {
  const $layout = $('#appLayout');
  const SIDEBAR_KEY = 'admin_sidebar_collapsed';

  // 初始：記憶 or 小螢幕預設收合
  const remembered = localStorage.getItem(SIDEBAR_KEY);
  if (remembered === '1' || (!remembered && window.innerWidth < 1366)) {
    $layout.addClass('is-collapsed');
  }

  // 把 label 文案塞進 title，讓收合時能顯示 tooltip
  function prepareSidebarTitles() {
    $('.sidebar .menu .nav-link').each(function () {
      const $link = $(this);
      if (!$link.attr('title') && !$link.attr('data-bs-original-title')) {
        const txt = $.trim($link.find('.label').text());
        if (txt) $link.attr('title', txt);
      }
      $link.attr('data-bs-toggle', 'tooltip')
           .attr('data-bs-placement', 'right')
           .attr('data-bs-container', 'body');
    });
  }

  // 重新掛 Tooltip（避免重複）
  function refreshSidebarTooltips() {
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

  // 只有「收合狀態」才啟用 tooltip，展開則停用
  function toggleTooltipsBySidebarState() {
    const collapsed = $layout.hasClass('is-collapsed');
    $('.sidebar .menu .nav-link').each(function () {
      const inst = bootstrap.Tooltip.getInstance(this);
      if (!inst) return;
      if (collapsed) inst.enable();
      else inst.disable();
    });
  }

  // 切換側欄
  $('#toggleSidebar').on('click', function () {
    $layout.toggleClass('is-collapsed');
    localStorage.setItem(SIDEBAR_KEY, $layout.hasClass('is-collapsed') ? '1' : '0');
    refreshSidebarTooltips();
    toggleTooltipsBySidebarState();
  });

  // 初始化
  prepareSidebarTitles();
  refreshSidebarTooltips();
  toggleTooltipsBySidebarState();
});

/* ==============================
   左側選單：導航與高亮
============================== */
$(function () {
  // 點擊：只有假連結才阻擋導頁
  $('.menu').on('click', '.nav-item:not(.is-disabled) .nav-link', function (e) {
    const href = ($(this).attr('href') || '').trim();
    const noNav = href === '' || href === '#' || href === 'javascript:;';
    if (noNav) e.preventDefault();

    // 先行切換高亮（即使導頁也先切，避免閃爍）
    $('.menu .nav-item').removeClass('is-active');
    $(this).closest('.nav-item').addClass('is-active');
  });

  // 載入時依目前網址自動高亮
  (function setActiveByURL() {
    const current = location.pathname.split('/').pop(); // 例如 page030.html
    if (!current) return;
    let activated = false;
    $('.menu .nav-link').each(function () {
      const href = ($(this).attr('href') || '').trim();
      if (href && href === current) {
        $('.menu .nav-item').removeClass('is-active');
        $(this).closest('.nav-item').addClass('is-active');
        activated = true;
      }
    });
    // 若都沒比到，維持原本 HTML 設的 is-active
    if (!activated) return;
  })();

  // 禁用項目：阻擋點擊但允許 tooltip
  $('.sidebar').on('click', '.menu .is-disabled .nav-link', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
});

/* ==============================
   通知抽屜（鈴鐺）
============================== */
$(function () {
  const $drawer   = $('#notifDrawer');
  const $backdrop = $('#notifBackdrop');
  const $openBtn  = $('.js-open-notif');
  const $closeBtn = $('.js-close-notif');
  const $markAll  = $('.js-mark-all');
  const $badgeTop = $('.notif-count');         // 頂欄紅點數字
  const $badgeHdr = $('.js-unread-badge');     // 抽屜標題徽章（粉紅 / 全部已讀）

  function unreadCount() {
    return $drawer.find('.notif-item.is-unread').length;
  }

  function syncBadges() {
    const n = unreadCount();
    if (n > 0) {
      $badgeTop.text(n).show();
      $badgeHdr.text(n + '則未讀').removeClass('bg-secondary').addClass('bg-unread');
    } else {
      $badgeTop.hide();
      $badgeHdr.text('全部已讀').removeClass('bg-unread').addClass('bg-secondary');
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

  // 開關
  $openBtn.on('click', function (e) { e.preventDefault(); openDrawer(); });
  $closeBtn.on('click', function () { closeDrawer(); });
  $backdrop.on('click', function () { closeDrawer(); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  // 單筆已讀：按鈕
  $drawer.on('click', '.js-mark-read', function (e) {
    e.preventDefault();
    markItemRead($(this).closest('.notif-item'));
  });

  // 單筆已讀：點擊未讀卡片本身也可已讀（避免點到功能列）
  $drawer.on('click', '.notif-item.is-unread', function (e) {
    // 若點到可交互元素就不處理
    const tag = (e.target.tagName || '').toLowerCase();
    const isInteractive = $(e.target).is('a,button,[role="button"],input,textarea,select,.btn,.icon-btn');
    if (isInteractive || tag === 'a' || tag === 'button') return;
    markItemRead($(this));
  });

  function markItemRead($item) {
    $item.removeClass('is-unread');
    syncBadges();
  }

  // 全部已讀
  $markAll.on('click', function () {
    $drawer.find('.notif-item').removeClass('is-unread');
    syncBadges();
  });

  // 初始徽章
  syncBadges();
});


// === 共用：水平拖拉捲動 for .table-responsive ===
(function setupGlobalHorizontalDrag () {
  const $wraps = $('.table-responsive');

  $wraps.each(function () {
    const $el = $(this);
    const el = this;

    // 若已初始化過就略過（避免重複綁定）
    if ($el.data('drag-ready')) return;
    $el.data('drag-ready', true);

    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    function updateEdges() {
      const has = el.scrollWidth > el.clientWidth + 1;
      $el.toggleClass('has-scroll', has);
      if (!has) { $el.removeClass('at-left at-right'); return; }
      const max = el.scrollWidth - el.clientWidth;
      const x = el.scrollLeft;
      $el.toggleClass('at-left',  x <= 0);
      $el.toggleClass('at-right', x >= max - 1);
    }

    // 滑鼠拖拉
    $el.on('mousedown', function (e) {
      if (e.button !== 0) return; // 只吃左鍵
      isDown = true;
      $el.addClass('is-dragging');
      startX = e.pageX;
      startScroll = el.scrollLeft;
      e.preventDefault();
    });

    $(window).on('mouseup', function () {
      isDown = false;
      $el.removeClass('is-dragging');
    });

    $el.on('mouseleave', function () {
      isDown = false;
      $el.removeClass('is-dragging');
    });

    $el.on('mousemove', function (e) {
      if (!isDown) return;
      const dx = e.pageX - startX;
      el.scrollLeft = startScroll - dx; // 反向拖移
    });

    // Shift + 滑輪 => 橫向捲動
    $el.on('wheel', function (e) {
      if (!e.shiftKey) return;
      el.scrollLeft += e.originalEvent.deltaY;
      e.preventDefault();
    });

    // 捲動/尺寸改變時更新陰影狀態
    $el.on('scroll', updateEdges);
    $(window).on('resize', updateEdges);

    // 初始判斷
    updateEdges();
  });
})();
