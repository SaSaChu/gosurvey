// content.js (consolidated, fixed)

// -------------------------------------
// 一次性初始化：Bootstrap Tooltip
// -------------------------------------
$(function () {
  initTooltips(document);
});

function initTooltips(scope) {
  (scope || document).querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    var inst = bootstrap.Tooltip.getInstance(el);
    if (inst) inst.dispose();
    new bootstrap.Tooltip(el, { container: 'body' });
  });
}

// -------------------------------------
// 模組：新增按鈕（保留可換連結）
// -------------------------------------
$(function () {
  $('.module-card').on('click', '.btn-primary', function (e) {
    // e.preventDefault();
    // location.href = 'page020-new.html';
  });
});

// -------------------------------------
// 共用刪除 Modal（卡片／表格列都走這裡）
// -------------------------------------
(function () {
  var $pendingTarget = null;    // jQuery 物件：要移除的元素
  var pendingLabel  = '刪除確認';  // Modal 標題
  var pendingText   = '你確定要刪除這個項目嗎？刪除後將無法復原。'; // Modal 文字

  // 任何刪除鍵（卡片/表格列）都進來這裡
  $(document).on('click', '.js-card-delete, .js-row-delete', function (e) {
    e.preventDefault();

    var $btn = $(this);

    // 先猜最合理的外層：表格列 > 卡片欄位 > 卡片/節點 > 保底按鈕自己
    $pendingTarget =
      $btn.closest('tr').length ? $btn.closest('tr') :
      $btn.closest('.col-12, .col-md-6, .col-xl-3').length ? $btn.closest('.col-12, .col-md-6, .col-xl-3') :
      $btn.closest('.tmpl-card, .send-node').length ? $btn.closest('.tmpl-card, .send-node') :
      $btn;

    // 文案：若是表格列，用「模板」；否則用「卡片/項目」
    if ($pendingTarget.is('tr')) {
      pendingLabel = '刪除確認';
      pendingText  = '你確定要刪除這個模板嗎？刪除後將無法復原。';
    } else {
      pendingLabel = '刪除確認';
      pendingText  = '你確定要刪除這個項目嗎？刪除後將無法復原。';
    }

    openConfirm();
  });

  function openConfirm() {
    var modalEl = document.getElementById('confirmDeleteModal');
    if (!modalEl) return;
    $('#confirmDeleteLabel').text(pendingLabel);
    $('#confirmDeleteModal .modal-body').text(pendingText);
    bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: 'static' }).show();
  }

  // 確認刪除（只綁一次）
  $(document)
    .off('click.confirmDelete')
    .on('click.confirmDelete', '#confirmDeleteBtn', function () {
      if ($pendingTarget && $pendingTarget.length) {
        if ($pendingTarget.is('tr')) {
          $pendingTarget.remove();
        } else {
          $pendingTarget.fadeOut(200, function () { $(this).remove(); });
        }
      }
      $pendingTarget = null;

      var modalEl = document.getElementById('confirmDeleteModal');
      if (modalEl) {
        var inst = bootstrap.Modal.getInstance(modalEl);
        if (inst) inst.hide();
      }
    });
})();

// -------------------------------------
// page03：模板頁 tabs 篩選（僅當有 data-channel 時）
// -------------------------------------
$(document).on('click', '.gs-tabs .nav-link', function () {
  var $btn = $(this);
  var ch = $btn.data('channel');
  if (typeof ch === 'undefined') return; // 非渠道篩選的 tabs 交給其他 handler

  // 視覺 active（只在同一組 tabs）
  $btn.closest('.gs-tabs').find('.nav-link').removeClass('active');
  $btn.addClass('active');

  // 只篩同一個 page-content 內的表格
  var $scope = $btn.closest('.page-content');
  var $tbody = $scope.find('.gs-tbody');
  if (!$tbody.length) $tbody = $('.gs-tbody');

  if (ch === 'all') {
    $tbody.find('tr').removeClass('d-none');
  } else {
    $tbody.find('tr').each(function () {
      $(this).toggleClass('d-none', $(this).data('channel') !== ch);
    });
  }
});

// -------------------------------------
// page04：上層三分頁（用 data-target 切換 .tab-panel）
// -------------------------------------
$(document).on('click', '.gs-tabs-top .nav-link[data-target], .gs-tabs .nav-link[data-target]', function (e) {
  var $btn = $(e.currentTarget);
  var target = $btn.attr('data-target');
  if (!target) return;

  e.preventDefault();
  if ($btn.is('.disabled,[aria-disabled="true"]')) return;

  // 視覺 active（同一組 tabs）
  $btn.closest('.gs-tabs').find('.nav-link')
      .removeClass('active').attr('aria-selected', 'false');
  $btn.addClass('active').attr('aria-selected', 'true');

  // 切面板（同一個 page-content 作用域）
  var $scope = $btn.closest('.page-content');
  $scope.find('.tab-panel').addClass('d-none');
  $scope.find(target).removeClass('d-none');

  // 進到發送異常面板時，確保資料列不被渠道篩選藏起來
  if (target === '#tab-issues') {
    $scope.find('#tab-issues .gs-tbody tr').removeClass('d-none');
  }

  // 面板內若有新 tooltip 元素，重新初始化
  initTooltips($scope.find(target)[0]);
});

// -------------------------------------
// 通用：三階層展開/收合（L1/L2/L3）
// -------------------------------------
$(document).on('click', '.js-node-toggle', function () {
  var $btn = $(this);
  var expanded = $btn.attr('aria-expanded') === 'true';
  var id = $btn.attr('aria-controls');
  var $panel = $('#' + id);
  var $node = $btn.closest('.send-node');

  $btn.attr('aria-expanded', !expanded);
  $node.toggleClass('is-open', !expanded);

  var $i = $btn.find('i.bi');
  if ($i.length) {
    $i.toggleClass('bi-caret-down-fill', !expanded)
      .toggleClass('bi-caret-right-fill', expanded);
  }

  if ($panel.length) {
    if (expanded) {
      $panel.stop(true, true).slideUp(150, function () { $panel.addClass('d-none'); });
    } else {
      $panel.removeClass('d-none').hide().stop(true, true).slideDown(150);
    }
  }
});

// -------------------------------------
// 可用參數 chips → 預覽區（建立模板用）
// -------------------------------------
$(function () {
  var examples = {
    1: '第一個項目：ＯＯＯＯＯＯＯ',
    2: '第二個項目：示例文字',
    3: '第三個項目：示例文字',
    4: '第四個項目：示例文字',
    5: '第五個項目：示例文字'
  };

  var $chips = $('.js-param');
  var $previewData = $('#previewData');
  $previewData.empty();

  $chips.on('click', function () {
    var idx = $(this).data('idx');
    var text = examples[idx] || '';
    $(this).toggleClass('is-active');

    var $existing = $previewData.find('[data-idx="' + idx + '"]');
    if ($(this).hasClass('is-active')) {
      if ($existing.length === 0) {
        $previewData.append('<div class="mb-1" data-idx="' + idx + '">' + text + '</div>');
      }
    } else {
      $existing.remove();
    }
  });
});


// -------------------------------------
// 共用：水平拖拉捲動 for .table-responsive & .h-scroll
// -------------------------------------
(function setupGlobalHorizontalDrag () {
  var $wraps = $('.table-responsive, .h-scroll');

  $wraps.each(function () {
    var $el = $(this);
    var el = this;

    if ($el.data('drag-ready')) return;
    $el.data('drag-ready', true);

    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    function updateEdges() {
      var has = el.scrollWidth > el.clientWidth + 1;
      $el.toggleClass('has-scroll', has);
      if (!has) { $el.removeClass('at-left at-right'); return; }
      var max = el.scrollWidth - el.clientWidth;
      var x = el.scrollLeft;
      $el.toggleClass('at-left',  x <= 0);
      $el.toggleClass('at-right', x >= max - 1);
    }

    $el.on('mousedown', function (e) {
      if (e.button !== 0) return;
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
      var dx = e.pageX - startX;
      el.scrollLeft = startScroll - dx;
    });

    // Shift + 滾輪 => 橫向捲動
    $el.on('wheel', function (e) {
      if (!e.shiftKey) return;
      el.scrollLeft += e.originalEvent.deltaY;
      e.preventDefault();
    });

    // 捲動/尺寸改變時更新陰影狀態
    $el.on('scroll', updateEdges);
    $(window).on('resize', updateEdges);

    updateEdges();
  });
})();


// 暫停 ⇄ 恢復（L1 與 L3 共用）
$(document).on('click', '.js-toggle-run, .js-l3-toggle', function () {
  const $btn  = $(this);
  const $icon = $btn.find('i');

  const toResume = $btn.hasClass('btn-pause'); // 目前是【暫停】，點了要變【恢復】

  if (toResume) {
    $btn.removeClass('btn-pause').addClass('btn-resume')
        .attr('aria-pressed', 'true')
        .attr('data-bs-original-title', '恢復');   // tooltip 文
    $icon.removeClass('bi-pause').addClass('bi-play');
  } else {
    $btn.removeClass('btn-resume').addClass('btn-pause')
        .attr('aria-pressed', 'false')
        .attr('data-bs-original-title', '暫停');
    $icon.removeClass('bi-play').addClass('bi-pause');
  }

  // 重建 tooltip
  const inst = bootstrap.Tooltip.getInstance(this);
  if (inst) inst.dispose();
  new bootstrap.Tooltip(this, { container: 'body' });
});

// L3 設定：開啟光箱
$(document).on('click', '.js-l3-settings', function () {
  const modalEl = document.getElementById('l3SettingsModal');
  if (!modalEl) return;
  // 你要填入的 row 內容也可以在這裡動態塞入
  bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: 'static' }).show();
});


// 讓右側自訂日曆按鈕能開啟原生 date picker
document.querySelectorAll('#filterModal .date-field').forEach(group => {
  const input = group.querySelector('input[type="date"]');
  const btn = group.querySelector('.input-group-text');
  if (input && btn) {
    btn.addEventListener('click', () => {
      if (typeof input.showPicker === 'function') {
        input.showPicker();      // 支援的瀏覽器直接叫出
      } else {
        input.focus();           // 不支援就聚焦
        input.click();           // 嘗試觸發
      }
    });
  }
});


// 下載按鈕 → 開啟匯出報表 Modal
$(document).on('click', '.js-open-export', function () {
  const el = document.getElementById('exportModal');
  bootstrap.Modal.getOrCreateInstance(el, { backdrop: 'static' }).show();
});

// 啟用 tooltip（若你已有全域初始化，可略過）
$(function () {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    const inst = bootstrap.Tooltip.getInstance(el);
    if (inst) inst.dispose();
    new bootstrap.Tooltip(el, { container: 'body' });
  });
});


document.addEventListener('click', (e) => {
  const btn = e.target.closest('.js-l3-settings');
  if (!btn) return;
  const m = new bootstrap.Modal(document.getElementById('priorityModal'));
  m.show();
});


// 頁面載入後自動展開第一層與第一個子層
$(document).ready(function () {
  // 第一層（L1）展開
  const $firstL1 = $('.send-node.node-l1').first();
  $firstL1.addClass('is-open');
  $firstL1.find('.js-node-toggle')
          .attr('aria-expanded', 'true')
          .find('i')
          .removeClass('bi-caret-right-fill')
          .addClass('bi-caret-down-fill');
  $firstL1.find('.node-children').first().removeClass('d-none');

  // 第一層中的第一個 L2 也展開
  const $firstL2 = $firstL1.find('.send-node.node-l2').first();
  $firstL2.find('.js-node-toggle')
          .attr('aria-expanded', 'true')
          .find('i')
          .removeClass('bi-caret-right-fill')
          .addClass('bi-caret-down-fill');
  $firstL2.find('.node-children').removeClass('d-none');
});


// ===== KPI 數字進場動畫 =====
(function () {
  function formatNumber(n, decimals, useComma) {
    const num = Number(n);
    return useComma
      ? num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : num.toFixed(decimals);
  }

  function countUp(el, opts) {
    const target = parseFloat(opts.count);
    const decimals = parseInt(opts.decimals || 0, 10);
    const suffix = opts.suffix || '';
    const useComma = (opts.format || '').toLowerCase() === 'comma';

    const duration = 1500; // ms
    const start = performance.now();

    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const value = target * p;
      el.textContent = formatNumber(value, decimals, useComma) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initKpiCounter() {
    const els = document.querySelectorAll('.kpi-value[data-count]');
    if (!els.length) return;

    // 用 IntersectionObserver 只動畫一次，且在可視區才跑
    const seen = new WeakSet();
    const run = el => {
      if (seen.has(el)) return;
      seen.add(el);
      countUp(el, {
        count: el.dataset.count,
        decimals: el.dataset.decimals,
        suffix: el.dataset.suffix,
        format: el.dataset.format
      });
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) run(e.target); });
      }, { threshold: 0.4 });
      els.forEach(el => io.observe(el));
    } else {
      // fallback
      els.forEach(run);
    }
  }

  document.addEventListener('DOMContentLoaded', initKpiCounter);
})();


// 問卷啟用／停用 切換
$(document).on('click', '.js-toggle-status', function () {
  const $btn = $(this);
  const $icon = $btn.find('i');

  if ($icon.hasClass('bi-stop')) {
    // 從 停用 → 啟用
    $icon.removeClass('bi-stop').addClass('bi-play');
    $btn.attr('title', '問卷啟用');
  } else {
    // 從 啟用 → 停用
    $icon.removeClass('bi-play').addClass('bi-stop');
    $btn.attr('title', '問卷停用');
  }

  // 更新 Bootstrap Tooltip 的內容（即時刷新 title）
  const tooltip = bootstrap.Tooltip.getInstance($btn[0]);
  if (tooltip) {
    tooltip.setContent({ '.tooltip-inner': $btn.attr('title') });
  }
});

