/* ==========================================================================
   QAYD — فاتورة المبيعات: يعتمد على qayd_global.js للقوائم البحثية والتنقل
   - Enter في خانة الصنف → قائمة بحثية (النظام الشامل)
   - Enter آخر خانة (الخصم) → إضافة بند تلقائياً
   - F2 صنف جديد | F4 تكرار آخر صنف | Ctrl+Enter إدراج الفاتورة
   ========================================================================== */
(function () {
	'use strict';

	var ITEM_FIELDS = ['_stock_id_edit', 'stock_id', 'qty', 'price', 'Disc'];

	function $(name) {
		return document.querySelector('[name="' + name + '"]');
	}

	function focusField(name) {
		var el = $(name);
		if (el) {
			el.focus();
			try { el.select(); } catch (e) {}
			return true;
		}
		return false;
	}

	// معالج مخصص لكومبو الصنف: اختيار → انتقال لخانة الكمية
	function stockComboHandler(sel, edit) {
		var mapping = window.Qayd.mapAction('stock_id');
		function doPick(it) {
			window.Qayd.applyToCombo(sel, edit, it);
			setTimeout(function () { focusField('qty'); }, 300);
		}
		var v = edit ? edit.value.trim() : '';
		if (!v) {
			window.Qayd.openSearchPopup('items', 'الأصناف', edit || sel, '', doPick);
			return;
		}
		fetch(window.Qayd.ajaxUrl() + '?action=items&q=' + encodeURIComponent(v), { credentials: 'same-origin' })
			.then(function (r) { return r.json(); })
			.then(function (data) {
				data = data.error ? [] : data;
				if (data.length === 1) {
					doPick({ value: String(data[0].value), text: data[0].text });
				} else {
					window.Qayd.openSearchPopup('items', 'الأصناف', edit || sel, v, doPick);
				}
			})
			.catch(function () {
				window.Qayd.openSearchPopup('items', 'الأصناف', edit || sel, v, doPick);
			});
	}
	stockComboHandler.ownButton = true; // الزر ▼ الخاص بنا أدناه
	window.QaydComboHandlers = window.QaydComboHandlers || {};
	window.QaydComboHandlers['stock_id'] = stockComboHandler;

	// معالجات حقول صف البند (حتى لا يتدخل النظام الشامل)
	window.QaydFieldHandlers = window.QaydFieldHandlers || {};
	ITEM_FIELDS.forEach(function (n) { window.QaydFieldHandlers[n] = true; });

	/* ============ حساب إجمالي السطر لحظياً ============ */
	function liveTotal() {
		var qty = parseFloat(($('qty') || {}).value) || 0;
		var price = parseFloat(($('price') || {}).value) || 0;
		var disc = parseFloat(($('Disc') || {}).value) || 0;
		var total = qty * price * (1 - disc / 100);
		var addBtn = document.querySelector('[name="AddItem"]');
		if (addBtn) {
			var row = addBtn.closest('tr');
			if (row) {
				var cells = row.querySelectorAll('td');
				for (var i = 0; i < cells.length; i++) {
					if (cells[i + 1] && cells[i + 1].contains(addBtn) &&
						!cells[i].querySelector('input,button,select')) {
						cells[i].textContent = total.toFixed(2);
						cells[i].style.fontWeight = 'bold';
						cells[i].style.color = '#0f2242';
						break;
					}
				}
			}
		}
	}

	/* ============ تكرار آخر صنف (F4) ============ */
	function repeatLastItem() {
		var sel = $('stock_id');
		if (!sel || !window._qayd_last_item) return;
		for (var i = 0; i < sel.options.length; i++) {
			if (String(sel.options[i].value) === String(window._qayd_last_item)) {
				sel.selectedIndex = i;
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent('change', true, false);
				sel.dispatchEvent(ev);
				break;
			}
		}
		focusField('qty');
	}

	document.addEventListener('click', function (e) {
		var t = e.target;
		if (t && t.name === 'AddItem') {
			var sel = $('stock_id');
			if (sel) window._qayd_last_item = sel.value;
			setTimeout(function () { focusField('_stock_id_edit'); }, 700);
		}
	}, true);

	/* ============ شريط التلميحات ============ */
	function hintBar() {
		if (document.getElementById('qayd-keys-hint')) return;
		var bar = document.createElement('div');
		bar.id = 'qayd-keys-hint';
		bar.innerHTML = '<b>اختصارات:</b> <kbd>Enter</kbd> تنقل / قائمة بحثية <kbd>↑↓</kbd> تنقل <kbd>Enter</kbd> اختيار '
			+ '<kbd>F2</kbd> صنف جديد <kbd>F4</kbd> تكرار آخر صنف <kbd>Ctrl+Enter</kbd> إدراج الفاتورة <kbd>Esc</kbd> إغلاق';
		var titleTable = document.getElementById('title');
		if (titleTable && titleTable.parentNode) titleTable.parentNode.insertBefore(bar, titleTable);
		else document.body.insertBefore(bar, document.body.firstChild);
	}

	/* ============ التنقل في صف البند ============ */
	document.addEventListener('keydown', function (e) {
		var t = e.target;
		if (!t || !t.name) return;
		var tag = (t.tagName || '').toLowerCase();
		if (!document.querySelector('[name="AddItem"]')) return;

		if (e.key === 'F2') { e.preventDefault(); focusField('_stock_id_edit'); return; }
		if (e.key === 'F4') { e.preventDefault(); repeatLastItem(); return; }
		if (e.key === 'Enter' && e.ctrlKey) {
			e.preventDefault();
			var po = $('ProcessOrder');
			if (po) po.click();
			return;
		}

		var idx = ITEM_FIELDS.indexOf(t.name);
		if (idx === -1) return;

		if (e.key === 'Enter' && !e.ctrlKey && (tag === 'input' || tag === 'select')) {
			e.preventDefault();
			e.stopPropagation();
			if (t.name === '_stock_id_edit') {
				stockComboHandler($('stock_id'), t);
				return;
			}
			if (idx < ITEM_FIELDS.length - 1) focusField(ITEM_FIELDS[idx + 1]);
			else {
				var add = $('AddItem');
				if (add) add.click();
			}
			return;
		}

		if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && idx > 0) {
			e.preventDefault();
			e.stopPropagation();
			var ni = idx + (e.key === 'ArrowDown' ? 1 : -1);
			if (ni >= 0 && ni < ITEM_FIELDS.length) focusField(ITEM_FIELDS[ni]);
		}
	}, true);

	document.addEventListener('input', function (e) {
		if (e.target && (e.target.name === 'qty' || e.target.name === 'price' || e.target.name === 'Disc')) liveTotal();
	}, true);

	/* ============ زر ▼ بجانب حقل الصنف ============ */
	function addItemDropButton() {
		var sel = document.querySelector('select[name="stock_id"]');
		if (!sel || sel.dataset.qaydBtn) return;
		sel.dataset.qaydBtn = '1';
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'qayd-dropbtn';
		btn.textContent = '▼';
		btn.title = 'القائمة البحثية للأصناف';
		btn.tabIndex = -1;
		btn.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopPropagation();
			if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
			stockComboHandler(sel, document.querySelector('[name="_stock_id_edit"]'));
		}, true);
		sel.parentNode.insertBefore(btn, sel.nextSibling);
	}

	function init() {
		hintBar();
		addItemDropButton();
		var ae = document.activeElement;
		if (document.querySelector('[name="AddItem"]') && (!ae || ae === document.body)) focusField('_stock_id_edit');
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
	setInterval(function () {
		if (document.querySelector('[name="AddItem"]')) {
			hintBar();
			addItemDropButton();
		}
	}, 2000);
})();
