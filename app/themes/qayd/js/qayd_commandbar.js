/* ==========================================================================
   QAYD COMMAND BAR — شريط أوامر ثابت مثل أوراكل
   🆕 جديد | 💾 إدراج | 🗑️ إلغاء | 🖨️ طباعة | 👁️ معاينة | ⏮ السابق | التالي ⏭
   ========================================================================== */
(function () {
	'use strict';

	// إعدادات كل صفحة
	var PAGES = {
		'sales_order_entry.php': {
			title: 'فاتورة مبيعات',
			isInvoice: true,
			newUrl: 'sales_order_entry.php?NewInvoice=0',
			saveBtn: 'ProcessOrder',
			cancelBtn: 'CancelOrder',
			listUrl: 'sales/inquiry/sales_orders_view.php'
		},
		'purch_order_entry.php': {
			title: 'أمر شراء',
			newUrl: 'purch_order_entry.php?NewOrder=1',
			saveBtn: 'ProcessOrder',
			cancelBtn: 'CancelOrder',
			listUrl: 'purchasing/inquiry/po_search.php'
		},
		'customer_invoice.php': {
			title: 'فاتورة مبيعات',
			isInvoice: true,
			newUrl: 'customer_invoice.php?New=1',
			saveBtn: 'Process',
			cancelBtn: 'Cancel',
			listUrl: 'sales/inquiry/sales_orders_view.php'
		}
	};

	var page = location.pathname.split('/').pop().split('?')[0];
	var cfg = PAGES[page];
	if (!cfg) return;

	function $(name) {
		return document.querySelector('[name="' + name + '"]');
	}

	function basePath() {
		// مسار جذر FA من عنوان الصفحة
		var p = location.pathname;
		return p.substring(0, p.lastIndexOf('/sales/') > -1 ? p.lastIndexOf('/sales/') + 1 :
			(p.lastIndexOf('/purchasing/') > -1 ? p.lastIndexOf('/purchasing/') + 1 : p.lastIndexOf('/') + 1));
	}

	function btn(id, icon, label, fn, disabled) {
		var b = document.createElement('button');
		b.type = 'button';
		b.id = id;
		b.className = 'qayd-cmd-btn' + (disabled ? ' disabled' : '');
		b.innerHTML = '<span class="qayd-cmd-ico">' + icon + '</span><span>' + label + '</span>';
		b.addEventListener('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.stopImmediatePropagation) e.stopImmediatePropagation();
			if (b.classList.contains('disabled')) return;
			fn();
		}, true);
		return b;
	}

	function nativeClick(name) {
		var el = $(name);
		if (el) { el.click(); return true; }
		return false;
	}

	// نافذة المعاينة: ملخص الفاتورة الحالية
	function previewModal() {
		var old = document.getElementById('qayd-preview');
		if (old) old.parentNode.removeChild(old);

		var m = document.createElement('div');
		m.id = 'qayd-preview';
		m.innerHTML = '<div class="qayd-pv-box">'
			+ '<div class="qayd-pv-head"><span>معاينة ' + cfg.title + '</span>'
			+ '<button type="button" class="qayd-pv-x">✕</button></div>'
			+ '<div class="qayd-pv-body"></div>'
			+ '<div class="qayd-pv-foot"><button type="button" class="qayd-pv-print">🖨️ طباعة المعاينة</button></div>'
			+ '</div>';

		var body = m.querySelector('.qayd-pv-body');
		var html = '';

		// بيانات الترويسة
		var cust = document.querySelector('[name="customer_id"]');
		var ref = document.querySelector('[name="ref"]');
		var dt = document.querySelector('[name="OrderDate"], [name="tran_date"]');
		html += '<div class="qayd-pv-meta">';
		if (cust) html += '<div><b>العميل:</b> ' + (cust.options[cust.selectedIndex] ? cust.options[cust.selectedIndex].text : '') + '</div>';
		if (ref) html += '<div><b>المرجع:</b> ' + ref.value + '</div>';
		if (dt) html += '<div><b>التاريخ:</b> ' + dt.value + '</div>';
		html += '</div>';

		// البنود من جدول الأصناف
		html += '<table class="qayd-pv-table"><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الخصم%</th><th>الإجمالي</th></tr>';
		var rows = 0, grand = 0;
		document.querySelectorAll('table.tablestyle tr').forEach(function (tr) {
			var tds = tr.querySelectorAll('td');
			// صف بند: يحتوي نص صنف بدون حقول إدخال، وله 7+ خلايا
			if (tds.length >= 6 && !tr.querySelector('input[name="qty"]') && !tr.querySelector('select')) {
				var cells = Array.prototype.map.call(tds, function (td) { return td.textContent.trim(); });
				// تجاهل صفوف المجاميع
				if (/إجمالي|Shipping|مجموع/i.test(cells.join(' '))) return;
				if (!cells[0] || cells[0] === '') return;
				rows++;
				var total = parseFloat((cells[5] || '0').replace(/,/g, '')) || 0;
				grand += total;
				html += '<tr><td>' + cells[0] + ' ' + (cells[1] || '') + '</td><td>' + (cells[2] || '') + '</td>'
					+ '<td>' + (cells[4] || '') + '</td><td>' + (cells[5] || '') + '</td><td><b>' + (cells[6] || '') + '</b></td></tr>';
			}
		});
		html += '</table>';
		if (!rows) html += '<div class="qayd-pv-empty">لا توجد بنود مضافة بعد</div>';
		else html += '<div class="qayd-pv-grand">الإجمالي: <b>' + grand.toFixed(2) + '</b></div>';

		body.innerHTML = html;
		document.body.appendChild(m);
		m.querySelector('.qayd-pv-x').onclick = function () { m.parentNode.removeChild(m); };
		m.onclick = function (e) { if (e.target === m) m.parentNode.removeChild(m); };
		m.querySelector('.qayd-pv-print').onclick = function () { window.print(); };
	}

	function build() {
		if (document.getElementById('qayd-cmdbar')) return;
		var bar = document.createElement('div');
		bar.id = 'qayd-cmdbar';

		var bp = basePath();

		bar.appendChild(btn('qcb-new', '🆕', 'جديد', function () {
			location.href = bp + cfg.newUrl;
		}));
		bar.appendChild(btn('qcb-save', '💾', cfg.isInvoice ? 'إدراج الفاتورة' : 'حفظ', function () {
			if (!nativeClick(cfg.saveBtn)) {
				// بديل: أول زر submit رئيسي
				var s = document.querySelector('input[type=submit].inputsubmit, button.inputsubmit');
				if (s) s.click();
			}
		}));
		bar.appendChild(btn('qcb-del', '🗑️', 'إلغاء', function () {
			if (confirm('إلغاء ' + cfg.title + ' الحالية؟')) nativeClick(cfg.cancelBtn);
		}));
		bar.appendChild(btn('qcb-print', '🖨️', 'طباعة', function () { window.print(); }));
		bar.appendChild(btn('qcb-prev', '👁️', 'معاينة', previewModal));
		bar.appendChild(btn('qcb-back', '⏮', 'السابق', function () {
			location.href = bp + (cfg.listUrl || '');
		}));
		bar.appendChild(btn('qcb-next', 'التالي ⏭', '', function () {
			location.href = bp + (cfg.listUrl || '');
		}));

		// إدراج قبل جدول العنوان مباشرة (خارج أي صف جدول) — وفوق شريط التلميحات
		var hint = document.getElementById('qayd-keys-hint');
		var titleTable = document.getElementById('title');
		if (hint && hint.parentNode) hint.parentNode.insertBefore(bar, hint);
		else if (titleTable && titleTable.parentNode) titleTable.parentNode.insertBefore(bar, titleTable);
		else document.body.insertBefore(bar, document.body.firstChild);

		// تعطيل ذكي: لا إدراج بدون بنود
		setInterval(function () {
			var save = document.getElementById('qcb-save');
			if (!save) return;
			var hasLines = false;
			document.querySelectorAll('table.tablestyle tr').forEach(function (tr) {
				if (tr.querySelector('input[name="qty"]')) return; // صف الإدخال
				var tds = tr.querySelectorAll('td');
				if (tds.length >= 6 && tds[0].textContent.trim() !== '' && !/إجمالي|Shipping/i.test(tr.textContent)) {
					hasLines = true;
				}
			});
			save.classList.toggle('disabled', !hasLines);
		}, 1500);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
	else build();
	setTimeout(build, 2500); // بعد تحديثات أجاكس
})();
