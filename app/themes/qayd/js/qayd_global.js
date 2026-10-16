/* ==========================================================================
   QAYD GLOBAL — بحثيات + Enter في كل مكان بالنظام
   - Enter في أي خانة نصية → انتقال للخانة التالية
   - Enter في خانة بحث كومبو → مطابقة ذكية أو قائمة بحثية منبثقة
   - زر ▼ بجانب كل كومبو → قائمة بحثية
   ========================================================================== */
(function () {
	'use strict';

	// ربط اسم حقل الكومبو بنوع البحث في السيرفر
	var SEARCH_MAP = [
		{ re: /^stock_id$/, action: 'items', label: 'الأصناف' },
		{ re: /^customer_id$/, action: 'customers', label: 'العملاء' },
		{ re: /^supplier_id$/, action: 'suppliers', label: 'الموردين' },
		{ re: /account/, action: 'gl_accounts', label: 'الحسابات' },
		{ re: /^bank_act/, action: 'bank_accounts', label: 'الحسابات البنكية' },
		{ re: /loc/, action: 'locations', label: 'المواقع' }
	];

	// معالجات مخصصة تسجلها سكربتات الصفحات (مثل فاتورة المبيعات)
	window.QaydComboHandlers = window.QaydComboHandlers || {};

	var AJAX_URL = null;
	function ajaxUrl() {
		if (AJAX_URL) return AJAX_URL;
		var scripts = document.querySelectorAll('script[src*="qayd_global.js"]');
		if (scripts.length) {
			AJAX_URL = scripts[scripts.length - 1].src.replace('js/qayd_global.js', 'qayd_ajax.php');
		} else {
			AJAX_URL = 'themes/qayd/qayd_ajax.php';
		}
		return AJAX_URL;
	}

	function mapAction(selectName) {
		for (var i = 0; i < SEARCH_MAP.length; i++) {
			if (SEARCH_MAP[i].re.test(selectName)) return SEARCH_MAP[i];
		}
		return null;
	}

	function fireChange(el) {
		var ev;
		try { ev = new Event('change', { bubbles: true }); }
		catch (e) {
			ev = document.createEvent('HTMLEvents');
			ev.initEvent('change', true, false);
		}
		el.dispatchEvent(ev);
	}

	/* ================= القائمة المنبثقة ================= */
	var popup = null, popupList = null, popupSearch = null;
	var popupItems = [], popupHi = 0, popupOnPick = null, searchTimer = null;

	function closePopup() {
		if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
		popup = null; popupOnPick = null;
	}

	function renderPopupList() {
		popupList.innerHTML = '';
		if (!popupItems.length) {
			var d = document.createElement('div');
			d.className = 'qayd-pop-empty';
			d.textContent = 'لا توجد نتائج مطابقة';
			popupList.appendChild(d);
			return;
		}
		popupItems.forEach(function (it) {
			var div = document.createElement('div');
			div.className = 'qayd-pop-item' + (it.idx === popupHi ? ' hi' : '');
			div.textContent = it.text;
			div.dataset.idx = it.idx;
			div.onmousedown = function (e) { e.preventDefault(); pickPopup(it.idx); };
			div.onmousemove = function () { setHi(it.idx); };
			popupList.appendChild(div);
		});
	}

	function setHi(idx) {
		popupHi = idx;
		popupList.querySelectorAll('.qayd-pop-item').forEach(function (el) {
			el.classList.toggle('hi', parseInt(el.dataset.idx, 10) === idx);
		});
		var hi = popupList.querySelector('.qayd-pop-item.hi');
		if (hi) hi.scrollIntoView({ block: 'nearest' });
	}

	function moveHi(dir) {
		if (!popupItems.length) return;
		var pos = 0;
		for (var i = 0; i < popupItems.length; i++) {
			if (popupItems[i].idx === popupHi) { pos = i; break; }
		}
		pos = (pos + dir + popupItems.length) % popupItems.length;
		setHi(popupItems[pos].idx);
	}

	function pickPopup(idx) {
		var it = null;
		for (var i = 0; i < popupItems.length; i++) {
			if (popupItems[i].idx === idx) { it = popupItems[i]; break; }
		}
		var cb = popupOnPick;
		closePopup();
		if (it && cb) cb(it);
	}

	// فتح القائمة: action = نوع البحث، select = عنصر FA الأصلي (اختياري)
	function openSearchPopup(action, label, anchorEl, initialText, onPick) {
		closePopup();
		popupOnPick = onPick;
		popupHi = 0;

		popup = document.createElement('div');
		popup.className = 'qayd-pop';
		popup.innerHTML = '<div class="qayd-pop-title">' + label + '</div>'
			+ '<input class="qayd-pop-search" placeholder="ابحث بالكتابة هنا...">'
			+ '<div class="qayd-pop-list"><div class="qayd-pop-empty">جاري التحميل...</div></div>'
			+ '<div class="qayd-pop-foot">Enter اختيار الأول &nbsp;|&nbsp; ↑↓ تنقل &nbsp;|&nbsp; Esc إغلاق</div>';
		popupList = popup.querySelector('.qayd-pop-list');
		popupSearch = popup.querySelector('.qayd-pop-search');
		if (initialText) popupSearch.value = initialText;

		document.body.appendChild(popup);

		var r = anchorEl.getBoundingClientRect();
		popup.style.position = 'absolute';
		popup.style.top = (r.bottom + window.scrollY + 2) + 'px';
		popup.style.right = Math.max(8, document.documentElement.clientWidth - r.right - window.scrollX) + 'px';
		popup.style.minWidth = Math.max(r.width, 320) + 'px';
		popup.style.maxWidth = '480px';

		function load(q) {
			fetch(ajaxUrl() + '?action=' + action + '&q=' + encodeURIComponent(q || ''), { credentials: 'same-origin' })
				.then(function (resp) { return resp.json(); })
				.then(function (data) {
					if (!popup) return;
					data = data.error ? [] : data;
					popupItems = data.map(function (it, i) {
						return { idx: i, value: String(it.value), text: it.text };
					});
					popupHi = 0;
					renderPopupList();
					if (popupItems.length) setHi(0);
				})
				.catch(function () {
					if (!popup) return;
					popupItems = [];
					renderPopupList();
				});
		}

		load(popupSearch.value);
		popupSearch.focus();
		try { popupSearch.select(); } catch (e) {}

		popupSearch.addEventListener('input', function () {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(function () { load(popupSearch.value); }, 250);
		});
		popupSearch.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowDown') { e.preventDefault(); moveHi(1); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); moveHi(-1); }
			else if (e.key === 'Enter') { e.preventDefault(); pickPopup(popupHi); }
			else if (e.key === 'Escape') { e.preventDefault(); closePopup(); anchorEl.focus(); }
		});
		setTimeout(function () {
			document.addEventListener('mousedown', function h(e) {
				if (popup && !popup.contains(e.target)) {
					closePopup();
					document.removeEventListener('mousedown', h);
				}
			});
		}, 50);
	}

	// تطبيق اختيار على كومبو FA الأصلي
	function applyToCombo(sel, edit, it) {
		var found = false;
		for (var i = 0; i < sel.options.length; i++) {
			if (String(sel.options[i].value) === String(it.value)) { found = true; break; }
		}
		if (!found) {
			var opt = document.createElement('option');
			opt.value = it.value;
			opt.text = it.text;
			sel.appendChild(opt);
		}
		sel.value = it.value;
		fireChange(sel);
		if (edit) edit.value = it.text;
	}

	// مطابقة ذكية عند Enter في خانة بحث الكومبو
	function smartComboEnter(sel, edit) {
		// معالج مخصص للصفحة؟
		var custom = window.QaydComboHandlers[sel.name];
		if (custom) { custom(sel, edit); return; }

		var mapping = mapAction(sel.name);
		var label = mapping ? mapping.label : 'بحث';
		var v = edit ? edit.value.trim() : '';

		function doPick(it) {
			applyToCombo(sel, edit, it);
			// انتقل للخانة التالية بعد الاختيار
			setTimeout(function () { focusNext(edit || sel); }, 250);
		}

		if (!mapping) {
			// بدون بحث سيرفر: استخدم خيارات القائمة الأصلية
			openLocalPopup(sel, edit, doPick);
			return;
		}

		if (!v) {
			openSearchPopup(mapping.action, label, edit || sel, '', doPick);
			return;
		}
		// ابحث أولاً: نتيجة واحدة → اختيار مباشر، أكثر → قائمة
		fetch(ajaxUrl() + '?action=' + mapping.action + '&q=' + encodeURIComponent(v), { credentials: 'same-origin' })
			.then(function (r) { return r.json(); })
			.then(function (data) {
				data = data.error ? [] : data;
				if (data.length === 1) {
					doPick({ value: String(data[0].value), text: data[0].text });
				} else {
					openSearchPopup(mapping.action, label, edit || sel, v, doPick);
				}
			})
			.catch(function () { openSearchPopup(mapping.action, label, edit || sel, v, doPick); });
	}

	// قائمة من خيارات القائمة الأصلية (بدون سيرفر)
	function openLocalPopup(sel, edit, doPick) {
		closePopup();
		popupOnPick = doPick;
		popupHi = 0;
		popup = document.createElement('div');
		popup.className = 'qayd-pop';
		popup.innerHTML = '<input class="qayd-pop-search" placeholder="ابحث بالكتابة هنا...">'
			+ '<div class="qayd-pop-list"></div>'
			+ '<div class="qayd-pop-foot">Enter اختيار الأول &nbsp;|&nbsp; ↑↓ تنقل &nbsp;|&nbsp; Esc إغلاق</div>';
		popupList = popup.querySelector('.qayd-pop-list');
		popupSearch = popup.querySelector('.qayd-pop-search');
		document.body.appendChild(popup);
		var r = (edit || sel).getBoundingClientRect();
		popup.style.position = 'absolute';
		popup.style.top = (r.bottom + window.scrollY + 2) + 'px';
		popup.style.right = Math.max(8, document.documentElement.clientWidth - r.right - window.scrollX) + 'px';
		popup.style.minWidth = Math.max(r.width, 320) + 'px';

		function build(filter) {
			var f = (filter || '').trim().toLowerCase();
			popupItems = [];
			for (var i = 0; i < sel.options.length; i++) {
				var o = sel.options[i];
				var t = (o.text || '').trim();
				if (!t) continue;
				if (f && t.toLowerCase().indexOf(f) === -1 && String(o.value).toLowerCase().indexOf(f) === -1) continue;
				popupItems.push({ idx: popupItems.length, value: String(o.value), text: t });
				if (popupItems.length >= 80) break;
			}
			popupHi = 0;
			renderPopupList();
			if (popupItems.length) setHi(0);
		}
		build('');
		popupSearch.focus();
		popupSearch.addEventListener('input', function () { build(popupSearch.value); });
		popupSearch.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowDown') { e.preventDefault(); moveHi(1); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); moveHi(-1); }
			else if (e.key === 'Enter') { e.preventDefault(); pickPopup(popupHi); }
			else if (e.key === 'Escape') { e.preventDefault(); closePopup(); (edit || sel).focus(); }
		});
		setTimeout(function () {
			document.addEventListener('mousedown', function h(e) {
				if (popup && !popup.contains(e.target)) {
					closePopup();
					document.removeEventListener('mousedown', h);
				}
			});
		}, 50);
	}

	/* ================= التنقل بـ Enter ================= */
	function focusables() {
		return Array.prototype.slice.call(
			document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([disabled]), select:not([disabled]), textarea:not([disabled])')
		).filter(function (el) { return el.offsetParent !== null && el.name && el.type !== 'hidden'; });
	}

	function focusNext(fromEl) {
		var f = focusables();
		var i = f.indexOf(fromEl);
		if (i > -1 && i < f.length - 1) {
			f[i + 1].focus();
			try { if (f[i + 1].select && f[i + 1].tagName === 'INPUT') f[i + 1].select(); } catch (e) {}
			return true;
		}
		return false;
	}

	document.addEventListener('keydown', function (e) {
		var t = e.target;
		if (!t || !t.name) return;
		var tag = (t.tagName || '').toLowerCase();

		// لا تعبث مع textarea (Enter فيها سطر جديد)
		if (tag === 'textarea') return;
		// أزرار الإرسال: دع FA يتصرف
		if (t.type === 'submit' || t.type === 'button') return;

		if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && (tag === 'input' || tag === 'select')) {
			// خانة بحث كومبو؟ (input له rel يشير لقائمة، أو class يدل)
			var comboSel = null;
			if (tag === 'input') {
				// ابحث عن select مر تبط بهذا الحقل
				var cands = document.querySelectorAll('select.combo, select.combo2, select.combo3');
				for (var i = 0; i < cands.length; i++) {
					if (cands[i].getAttribute('rel') === t.name) { comboSel = cands[i]; break; }
				}
				// أو حقل بجانب زر بحث FA
				if (!comboSel && t.name.charAt(0) === '_' && t.name.slice(-5) === '_edit') {
					var selName = t.name.slice(1, -5);
					comboSel = document.querySelector('select[name="' + selName + '"]');
				}
			}
			if (comboSel) {
				e.preventDefault();
				smartComboEnter(comboSel, t);
				return;
			}
			// Enter عادي → الخانة التالية (منع الإرسال العرضي)
			// لكن: إذا الصفحة لها معالج مخصص لهذا الحقل، لا تتدخل
			if (window.QaydFieldHandlers && window.QaydFieldHandlers[t.name]) return;
			e.preventDefault();
			focusNext(t);
		}
	}, true);

	/* ================= زر ▼ لكل كومبو ================= */
	function addDropButtons() {
		document.querySelectorAll('select.combo, select.combo2, select.combo3').forEach(function (sel) {
			if (sel.dataset.qaydBtn || sel.offsetParent === null) return;
			// تخطَّ الكومبوهات ذات المعالج المخصص (تضيف زرها بنفسها)
			if (window.QaydComboHandlers[sel.name] && window.QaydComboHandlers[sel.name].ownButton) return;
			sel.dataset.qaydBtn = '1';
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'qayd-dropbtn';
			btn.textContent = '▼';
			btn.title = 'قائمة بحثية';
			btn.tabIndex = -1;
			// addEventListener + capture: يمنع نظام FA من اختطاف الزر
			btn.addEventListener('click', function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
				if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
				var edit = sel.getAttribute('rel') ? document.querySelector('[name="' + sel.getAttribute('rel') + '"]') : null;
				var custom = window.QaydComboHandlers[sel.name];
				if (custom) { custom(sel, edit); return; }
				var mapping = mapAction(sel.name);
				if (mapping) {
					openSearchPopup(mapping.action, mapping.label, edit || sel, edit ? edit.value : '', function (it) {
						applyToCombo(sel, edit, it);
					});
				} else {
					openLocalPopup(sel, edit, function (it) { applyToCombo(sel, edit, it); });
				}
			}, true);
			sel.parentNode.insertBefore(btn, sel.nextSibling);
		});
	}

	// واجهة للصفحات المخصصة
	window.Qayd = {
		openSearchPopup: openSearchPopup,
		applyToCombo: applyToCombo,
		focusNext: focusNext,
		ajaxUrl: ajaxUrl,
		mapAction: mapAction
	};

	function init() {
		addDropButtons();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
	setInterval(addDropButtons, 2500); // لعناصر أجاكس FA
})();
