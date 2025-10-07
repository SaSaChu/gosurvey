// js/admin.js
$(function () {
  // 啟用 Bootstrap Tooltips（收合時用得到）
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(el => new bootstrap.Tooltip(el, { boundary: document.body, placement: 'right' }));

  const $layout = $('#appLayout');
  const STORAGE_KEY = 'admin_sidebar_collapsed';

  // 初始狀態（桌機寬 < 1366 時預設收合）
  const remember = localStorage.getItem(STORAGE_KEY);
  if (remember === '1' || (!remember && window.innerWidth < 1366)) {
    $layout.addClass('is-collapsed');
  }

  // 切換側欄收合
  $('#toggleSidebar').on('click', function () {
    $layout.toggleClass('is-collapsed');
    const collapsed = $layout.hasClass('is-collapsed') ? '1' : '0';
    localStorage.setItem(STORAGE_KEY, collapsed);
  });

  // 點選選單：不可點的忽略；其他項目會切換 active 樣式
  $('.menu').on('click', '.nav-item:not(.is-disabled) .nav-link', function (e) {
    e.preventDefault();
    $('.menu .nav-item').removeClass('is-active');
    $(this).closest('.nav-item').addClass('is-active');
    // 在這裡導頁或載入內容…
  });
});
