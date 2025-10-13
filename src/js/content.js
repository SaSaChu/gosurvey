// content.js
$(function () {
  // 新增按鈕（可換連結）
  $('.module-card .btn-primary').on('click', function (e) {
    // e.preventDefault();
    // location.href = 'page020-new.html';
  });

  // 刪除流程
  let $pendingDeleteCard = null;
  $('.tmpl-grid').on('click', '.js-card-delete', function () {
    $pendingDeleteCard = $(this).closest('.col-12, .col-md-6, .col-xl-3'); // 外層欄位
    const modal = new bootstrap.Modal('#confirmDeleteModal', { backdrop: 'static' });
    modal.show();
  });

  $('#confirmDeleteBtn').on('click', function () {
    if ($pendingDeleteCard) {
      $pendingDeleteCard.fadeOut(200, function () {
        $(this).remove();
      });
      $pendingDeleteCard = null;
    }
    $('#confirmDeleteModal').modal('hide');
  });
});

$(function () {
  // 五個參數示例字串
  const examples = {
    1: '第一個項目：ＯＯＯＯＯＯＯ',
    2: '第二個項目：示例文字',
    3: '第三個項目：示例文字',
    4: '第四個項目：示例文字',
    5: '第五個項目：示例文字'
  };

  const $chips = $('.js-param');
  const $previewData = $('#previewData');

  // 起始：保持預覽區留白
  $previewData.empty();

  // 點「可用參數」：每點一次，往下新增一筆
  $chips.on('click', function () {
    const idx = $(this).data('idx');
    const text = examples[idx] || '';

    // 按鈕狀態
    $(this).toggleClass('is-active');

    // 如果當前被啟用就新增，否則移除那一行
    const $existing = $previewData.find(`[data-idx="${idx}"]`);
    if ($(this).hasClass('is-active')) {
      if ($existing.length === 0) {
        $previewData.append(`<div class="mb-1" data-idx="${idx}">${text}</div>`);
      }
    } else {
      $existing.remove();
    }
  });
});


// 問卷項目模板：tabs 篩選
$(function () {
  // 啟用 tooltip
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    new bootstrap.Tooltip(el, { container: 'body' });
  });

  // tabs
  $('.gs-tabs .nav-link').on('click', function () {
    $('.gs-tabs .nav-link').removeClass('active');
    $(this).addClass('active');

    const ch = $(this).data('channel');
    if (ch === 'all') {
      $('.gs-tbody tr').removeClass('d-none');
    } else {
      $('.gs-tbody tr').each(function () {
        $(this).toggleClass('d-none', $(this).data('channel') !== ch);
      });
    }
  });

  // 刪除（沿用共用 Modal）
  let $pendingRow = null;
  $('.gs-table').on('click', '.js-row-delete', function () {
    $pendingRow = $(this).closest('tr');
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    $('#confirmDeleteLabel').text('刪除確認');
    $('#confirmDeleteModal .modal-body').text('你確定要刪除這個模板嗎？刪除後將無法復原。');
    modal.show();
  });

  $('#confirmDeleteBtn').on('click', function () {
    if ($pendingRow) {
      $pendingRow.remove();
      $pendingRow = null;
    }
    const inst = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
    if (inst) inst.hide();
  });
});


