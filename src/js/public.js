// js/admin.js
$(function () {
  // 啟用 tooltip
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    new bootstrap.Tooltip(el, { boundary: document.body, placement: 'right' });
  });

  // 側欄收合記憶
  const $layout = $('#appLayout');
  const STORAGE_KEY = 'admin_sidebar_collapsed';
  const remember = localStorage.getItem(STORAGE_KEY);
  if (remember === '1' || (!remember && window.innerWidth < 1366)) {
    $layout.addClass('is-collapsed');
  }
  $('#toggleSidebar').on('click', function () {
    $layout.toggleClass('is-collapsed');
    localStorage.setItem(STORAGE_KEY, $layout.hasClass('is-collapsed') ? '1' : '0');
  });

  // ===== 通知抽屜 =====
  const $drawer = $('#notifDrawer');
  const $backdrop = $('#notifBackdrop');
  const $open = $('.js-open-notif');
  const $close = $('.js-close-notif');
  const $markAll = $('.js-mark-all');
  const $badgeTop = $('.notif-count');        // 頂欄紅點
  const $badgeHdr = $('.js-unread-badge');    // 抽屜標題紅點

  function unreadCount() {
    return $drawer.find('.notif-item.is-unread').length;
  }
  function syncBadges() {
    const n = unreadCount();
    $badgeTop.text(n)[n ? 'show' : 'hide']();
    $badgeHdr.text(n ? `${n} 則未讀` : '全部已讀')[
      n ? 'removeClass' : 'addClass'
    ]('bg-secondary').toggleClass('bg-danger', !!n);
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
  $open.on('click', function (e) { e.preventDefault(); openDrawer(); });
  $close.on('click', function () { closeDrawer(); });
  $backdrop.on('click', function () { closeDrawer(); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  // 單筆已讀
  $drawer.on('click', '.js-mark-read', function (e) {
    e.preventDefault();
    $(this).closest('.notif-item').removeClass('is-unread');
    syncBadges();
  });

  // 全部已讀
  $markAll.on('click', function () {
    $drawer.find('.notif-item').removeClass('is-unread');
    syncBadges();
  });

  // 初始同步
  syncBadges();

  // 側欄點選樣式切換（示例）
  $('.menu').on('click', '.nav-item:not(.is-disabled) .nav-link', function (e) {
    e.preventDefault();
    $('.menu .nav-item').removeClass('is-active');
    $(this).closest('.nav-item').addClass('is-active');
  });
});
