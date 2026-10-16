<?php
/**********************************************************************
    Copyright (C) FrontAccounting, LLC.
	Released under the terms of the GNU General Public License, GPL, 
	as published by the Free Software Foundation, either version 3 
	of the License, or (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
    See the License here <http://www.gnu.org/licenses/gpl-3.0.html>.
***********************************************************************/
	class renderer
	{
		function get_icon($category)
		{
			global  $path_to_root, $SysPrefs;

			if ($SysPrefs->show_menu_category_icons)
				$img = $category == '' ? 'right.gif' : $category.'.png';
			else	
				$img = 'right.gif';
			return "<img src='$path_to_root/themes/".user_theme()."/images/$img' style='vertical-align:middle;' border='0'>&nbsp;&nbsp;";
		}

		function wa_header()
		{
			page(_($help_context = "Main Menu"), false, true);
		}

		function wa_footer()
		{
			end_page(false, true);
		}

		function menu_header($title, $no_menu, $is_index)
		{
			global $path_to_root, $SysPrefs, $db_connections;
			// Qayd: النظام الشامل (بحثيات + Enter في كل مكان) — يُحمّل دائماً
			echo "<script src='$path_to_root/themes/".user_theme()."/js/qayd_global.js'></script>\n";
			// Qayd: سكربتات صفحات الفواتير (اختصارات + شريط الأوامر)
			$script = basename($_SERVER['SCRIPT_NAME']);
			if (in_array($script, array('sales_order_entry.php', 'purch_order_entry.php', 'customer_invoice.php'))) {
				echo "<script src='$path_to_root/themes/".user_theme()."/js/invoice_keys.js'></script>\n";
				echo "<script src='$path_to_root/themes/".user_theme()."/js/qayd_commandbar.js'></script>\n";
			}
			echo "<table class='callout_main' border='0' cellpadding='0' cellspacing='0'>\n";
			echo "<tr>\n";
			echo "<td colspan='2' rowspan='2'>\n";

			echo "<table class='main_page' border='0' cellpadding='0' cellspacing='0'>\n";
			echo "<tr>\n";
			echo "<td>\n";
			echo "<table width='100%' border='0' cellpadding='0' cellspacing='0'>\n";
			echo "<tr>\n";
			echo "<td class='quick_menu'>\n"; // tabs

			$indicator = "$path_to_root/themes/".user_theme(). "/images/ajax-loader.gif";
			if (!$no_menu)
			{
				$applications = $_SESSION['App']->applications;
				$local_path_to_root = $path_to_root;
				$sel_app = $_SESSION['sel_app'];
				echo "<table cellpadding='0' cellspacing='0' width='100%'><tr><td>";
				echo "<div class='tabs'>";
				foreach($applications as $app)
				{
                    if ($_SESSION["wa_current_user"]->check_application_access($app))
                    {
                        // اسم عربي مباشر
                        $tab_name = $this->qayd_ar_name($app->name);
                        $acc = access_string($tab_name);
                        echo "<a class='".($sel_app == $app->id ? 'selected' : 'menu_tab')
                            ."' href='$local_path_to_root/index.php?application=".$app->id
                            ."'$acc[1]>" .$acc[0] . "</a>";
                    }
				}
				echo "</div>";
				echo "</td></tr></table>";
				// top status bar
				$rimg = "<img src='$path_to_root/themes/".user_theme()."/images/report.png' style='width:14px;height:14px;border:0;vertical-align:middle;' alt='لوحة المؤشرات'>&nbsp;&nbsp;";
				$pimg = "<img src='$local_path_to_root/themes/".user_theme()."/images/preferences.gif' style='width:14px;height:14px; border:0;vertical-align:middle;' alt='الإعدادات المفضلة'>&nbsp;&nbsp;";
				$limg = "<img src='$local_path_to_root/themes/".user_theme()."/images/lock.gif' style='width:14px;height:14px;border:0;vertical-align:middle;' alt='تغيير كلمة المرور'>&nbsp;&nbsp;";
				$img = "<img src='$local_path_to_root/themes/".user_theme()."/images/login.gif' style='width:14px;height:14px;border:0;vertical-align:middle;' alt='تسجيل الخروج'>&nbsp;&nbsp;";
				$himg = "<img src='$local_path_to_root/themes/".user_theme()."/images/help.gif' style='width:14px;height:14px;border:0;vertical-align:middle;'' alt='المساعدة'>&nbsp;&nbsp;";
				echo "<table class='logoutBar'>";
				echo "<tr><td class='headingtext3'>" . $db_connections[user_company()]["name"] . " | " . $_SERVER['SERVER_NAME'] . " | " . $_SESSION["wa_current_user"]->name . "</td>";
				echo "<td class='logoutBarRight'><img id='ajaxmark' src='$indicator' align='center' style='visibility:hidden;' alt='ajaxmark'></td>";
				echo "<td class='logoutBarRight'><a href='$path_to_root/admin/dashboard.php?sel_app=$sel_app'>$rimg" . "لوحة المؤشرات" . "</a>&nbsp;&nbsp;&nbsp;\n";
				
				echo "<a class='shortcut' href='$path_to_root/admin/display_prefs.php?'>$pimg" . "الإعدادات المفضلة" . "</a>&nbsp;&nbsp;&nbsp;\n";
				echo "  <a class='shortcut' href='$path_to_root/admin/change_current_user_password.php?selected_id=" . $_SESSION["wa_current_user"]->username . "'>$limg" . "تغيير كلمة المرور" . "</a>&nbsp;&nbsp;&nbsp;\n";

				if ($SysPrefs->help_base_url != null)
				{
					echo "<a target = '_blank' onclick=" .'"'."javascript:openWindow(this.href,this.target); return false;".'" '. "href='". help_url()."'>$himg" . _("Help") . "</a>&nbsp;&nbsp;&nbsp;";
				}
				echo "<a class='shortcut' href='$local_path_to_root/access/logout.php?'>$img" . _("Logout") . "</a>&nbsp;&nbsp;&nbsp;";
				echo "</td></tr><tr><td colspan=3>";
				echo "</td></tr></table>";
			}
			echo "</td></tr></table>";

			if ($no_menu)
			{	// ajax indicator for installer and popups
				echo "<center><table class='tablestyle_noborder'>"
					."<tr><td><img id='ajaxmark' src='$indicator' align='center' style='visibility:hidden;' alt='ajaxmark'></td></tr>"
					."</table></center>";
			} elseif ($title && !$is_index)
			{
				echo "<center><table id='title'><tr><td width='100%' class='titletext'>$title</td>"
				."<td align=right>"
				.(user_hints() ? "<span id='hints'></span>" : '')
				."</td>"
				."</tr></table></center>";
			}
		}

		function menu_footer($no_menu, $is_index)
		{
			global $version, $path_to_root, $Pagehelp, $Ajax, $SysPrefs;

			include_once($path_to_root . "/includes/date_functions.inc");

			echo "</td></tr></table>\n"; // 'main_page'
			if ($no_menu == false) // bottom status line
			{
				if ($is_index)
					echo "<table class='bottomBar'>\n";
				else
					echo "<table class='bottomBar2'>\n";
				echo "<tr>";
				if (isset($_SESSION['wa_current_user'])) {
					$phelp = implode('; ', $Pagehelp);
					echo "<td class='bottomBarCell'>" . Today() . " | " . Now() . "</td>\n";
					$Ajax->addUpdate(true, 'hotkeyshelp', $phelp);
					echo "<td id='hotkeyshelp'>".$phelp."</td>";
				}
				echo "</tr></table>\n";
			}
			echo "</td></tr> </table>\n"; // 'callout_main'
			if ($no_menu == false)
			{
				echo "<table align='center' id='footer'>\n";
				echo "<tr>\n";
				echo "<td align='center' class='footer'><a target='_blank' href='".$SysPrefs->power_url."' tabindex='-1'><font color='#ffffff'>".$SysPrefs->app_title
					." $version - " . _("Theme:") . " " . user_theme() . " - ".show_users_online()."</font></a></td>\n";
				echo "</tr>\n";
				echo "<tr>\n";
				echo "<td align='center' class='footer'><a target='_blank' href='".$SysPrefs->power_url
					."' tabindex='-1'><font color='#ffff00'>".$SysPrefs->power_by."</font></a></td>\n";
				echo "</tr>\n";
				if ($SysPrefs->allow_demo_mode)
				{
					echo "<tr>\n";
					//echo "<td><br><div align='center'><a href='http://sourceforge.net'><img src='http://sourceforge.net/sflogo.php?group_id=89967&amp;type=5' alt='SourceForge.net Logo' width='210' height='62' border='0' align='center' /></a></div></td>\n";
					echo "</tr>\n";
				}
				echo "</table><br><br>\n";
			}
		}

		function qayd_kpi($label, $value, $icon)
		{
			return "<div class='qayd-kpi'><div class='qayd-kpi-icon'>$icon</div>"
				. "<div class='qayd-kpi-body'><div class='qayd-kpi-val'>$value</div>"
				. "<div class='qayd-kpi-lbl'>$label</div></div></div>";
		}

		function qayd_kpis()
		{
			$tb = TB_PREF;
			$today = date('Y-m-d');
			$kpis = "";
			$r = db_query("SELECT COALESCE(SUM(ov_amount+ov_discount),0) v FROM {$tb}debtor_trans WHERE type=10 AND tran_date='$today'");
			$row = db_fetch($r);
			$kpis .= $this->qayd_kpi('مبيعات اليوم', number_format((float)$row['v'], 2), '&#9670;');
			$r = db_query("SELECT COALESCE(SUM(amount),0) v FROM {$tb}gl_trans WHERE account='1200'");
			$row = db_fetch($r);
			$kpis .= $this->qayd_kpi('الذمم المدينة', number_format((float)$row['v'], 2), '&#9670;');
			$r = db_query("SELECT COALESCE(SUM(-amount),0) v FROM {$tb}gl_trans WHERE account='2100'");
			$row = db_fetch($r);
			$kpis .= $this->qayd_kpi('الذمم الدائنة', number_format((float)$row['v'], 2), '&#9670;');
			$r = db_query("SELECT COALESCE(SUM(amount),0) v FROM {$tb}gl_trans WHERE account IN ('1060','1065')");
			$row = db_fetch($r);
			$kpis .= $this->qayd_kpi('النقدية والبنوك', number_format((float)$row['v'], 2), '&#9670;');
			$r = db_query("SELECT COUNT(*) c FROM {$tb}debtors_master WHERE inactive=0");
			$row = db_fetch($r);
			$kpis .= $this->qayd_kpi('العملاء', (int)$row['c'], '&#9670;');
			return "<div class='qayd-kpis'>" . $kpis . "</div>";
		}

		// خريطة عربية مباشرة لأسماء التبويبات والوحدات (تتجاوز تخزين الجلسة)
		function qayd_ar_name($name)
		{
			static $map = null;
			if ($map === null)
			{
				$map = array(
				'&Access Setup' => 'إعدادات حسابات المستخدمين',
				'&Allocate Customer Payments or Credit Notes' => 'تخصيص مقبوضات العميل أو الإشعارات الدائنة',
				'&Allocate Supplier Payments or Credit Notes' => 'تخصيص مدفوعات الموردين و إشعاراتهم الدائنة',
				'&Attach Documents' => 'أرفاق المستندات',
				'&Backup and Restore' => 'النسخ الأحتياطي و الأسترجاع',
				'&Bills Of Material' => 'قائمة تركيبة المواد للبنود المخزنية المصنعة',
				'&Budget Entry' => 'إدخال الموازنات',
				'&Closing GL Transactions' => 'إقفال حركات الأستاذ',
				'&Company Setup' => 'إعدادات الشركة',
				'&Create and Print Recurrent Invoices' => 'إنشاء و طباعة الفواتير المتكررة',
				'&Currencies' => 'العملات',
				'&Delivery Against Sales Orders' => 'عمليات التسليم مقابل طلبات المبيعات',
				'&Deposits' => 'الإيداعات',
				'&Display Setup' => 'إعدادات العرض',
				'&Exchange Rates' => 'معدل تبادل العملات',
				'&Fiscal Years' => 'السنوات المالية',
				'&Foreign Item Codes' => 'أكواد البنود المخزنية الأجنبية',
				'&GL Accounts' => 'حسابات اليومية العامة',
				'&Invoice Against Sales Delivery' => 'الفاتورة مقابل عمليات تسليم المبيعات',
				'&Items' => 'البنود المخزنية',
				'&Journal Entry' => 'إدخال قيود اليومية العامة',
				'&Journal Inquiry' => 'إدخال قيود اليومية العامة',
				'&Outstanding Dimensions' => 'القطاعات التحليلية المنتهية',
				'&Outstanding Purchase Orders Maintenance' => 'نموذج الرقابة على أوامر الشراء المتأخرة',
				'&Outstanding Work Orders' => 'أوامر التشغيل المتأخرة',
				'&Payments' => 'الدفعات',
				'&Payments to Suppliers' => 'مدفوعات الموردين',
				'&Points of Sale' => 'نقاط البيع',
				'&Print Profiles' => 'الإعدادات الجانبية للطباعة',
				'&Printers' => 'الطابعات',
				'&Profit and Loss Drilldown' => 'تفصيل الأرباح والخسائر',
				'&Quick Entries' => 'الإدخالات السريعة',
				'&Reconcile Bank Account' => 'تسوية الحساب البنكي',
				'&Reorder Levels' => 'مستويات إعادة الطلب',
				'&Revaluation of Currency Accounts' => 'إعادة تقييم حسابات العملات',
				'&Suppliers' => 'الموردين',
				'&Taxes' => 'الضرائب',
				'&Template Delivery' => 'نماذج سندات التسليم - سندات التسليم الجاهزة',
				'&Template Invoice' => 'نماذج الفواتير - قاتورة جاهزة',
				'&Units of Measure' => 'وحدات القياس',
				'&User Accounts Setup' => 'إعدادات حسابات المستخدمين',
				'&Void a Transaction' => 'إلغاء حركة',
				'&Work Centres' => 'مراكز التكلفة',
				'Account &Tags' => 'حسابات اليومية العامة',
				'Add and Manage &Customers' => 'إضافة و إدارة العملاء',
				'Balance &Sheet Drilldown' => 'تفصيل الميزانية العمومية',
				'Bank &Accounts' => 'الحسابات البنكية',
				'Bank Account &Inquiry' => 'الإستعلام عن الحسابات البنكية',
				'Bank Account &Transfers' => 'التحويل بين الحسابات البنكية',
				'Banking &Reports' => 'التقارير البنكية',
				'Company Setup' => 'إعدادات الشركة',
				'Contact &Categories' => 'فئات جهات الاتصال',
				'Costed Bill Of Material Inquiry' => 'الإستعلام عن تكاليف قائمة تركيبة المواد',
				'Create/Update &Companies' => 'إنشاء و تحديث الشركات',
				'Credit &Status Setup' => 'إعدادات حالة الآئتمان',
				'Customer &Branches' => 'فروع العميل',
				'Customer &Credit Notes' => 'الإشعارات الدائنة للعميل',
				'Customer &Payments' => 'مقبوضات العملاء',
				'Customer Allocation &Inquiry' => 'الإستعلام عن حركات تخصيص الدفعات و الإشعارات الدائنة للعميل',
				'Customer Transaction &Inquiry' => 'الإستعلام عن الحركات الخاصة بالعميل',
				'Customer and Sales &Reports' => 'تقارير المبيعات و العملاء',
				'Dimension &Entry' => 'إدخال القطاع التحليلي',
				'Dimension &Inquiry' => 'الإستعلام عن القطاعات التحليلية',
				'Dimension &Reports' => 'تقارير القطاعات التحليلية',
				'Dimension &Tags' => 'القطاعات التحليلية',
				'Direct &Delivery' => 'عمليات التسليم المباشرة',
				'Direct &GRN' => 'سند استلام بضاعة مباشر',
				'Direct &Invoice' => 'فاتورة فورية',
				'Direct Supplier &Invoice' => 'فاتورة مورد مباشرة',
				'Fixed &Assets' => 'الأصول الثابتة',
				'Fixed Assets &Categories' => 'فئات الأصول الثابتة',
				'Fixed Assets &Disposal' => 'استبعاد الأصول الثابتة',
				'Fixed Assets &Locations' => 'مواقع الأصول الثابتة',
				'Fixed Assets &Movements' => 'حركات الأصول الثابتة',
				'Fixed Assets &Purchase' => 'شراء الأصول الثابتة',
				'Fixed Assets &Reports' => 'تقارير الأصول الثابتة',
				'Fixed Assets &Revaluation' => 'إعادة تقييم الأصول الثابتة',
				'Fixed Assets &Sale' => 'بيع الأصول الثابتة',
				'Fixed Assets Cl&asses' => 'فئات الأصول الثابتة',
				'Fixed Assets In&quiry' => 'استعلام الأصول الثابتة',
				'Fixed Assets Location &Transfers' => 'تحويلات مواقع الأصول الثابتة',
				'GL &Inquiry' => 'الإستعلام عن الحسابات العامة',
				'GL Account &Classes' => 'التصنيفات الرئيسية لحسابات اليومية العامة',
				'GL Account &Groups' => 'مجموعات حسابات اليومية العامة',
				'General Ledger &Reports' => 'تقارير اليومية العامة',
				'Inquiries and Reports' => 'الإستعلامات و التقارير',
				'Install/Activate &Chart of Accounts' => 'تثبيت/تفعيل دليل الحسابات',
				'Install/Activate &Extensions' => 'تثبيت/تفعيل الإضافات',
				'Install/Activate &Themes' => 'تثبيت/تفعيل السمات',
				'Install/Update &Languages' => 'تثبيت / تحديث اللغات',
				'Inventory &Adjustments' => 'قيود التعديل مخزنية',
				'Inventory &Locations' => 'مواقع التخزين للمخزون',
				'Inventory &Reports' => 'تقارير المخزون',
				'Inventory Item &Movements' => 'حركات بنود المخزون',
				'Inventory Item &Status' => 'حالة بنود المخزون',
				'Inventory Item Where Used &Inquiry' => 'الإستعلام عن البنود المخزنية التي تم أستخدامها',
				'Inventory Location &Transfers' => 'التحويلات المخزنية من و إلى مواقع التخزين',
				'Invoice &Prepaid Orders' => 'فوترة الطلبات المدفوعة مقدماً',
				'Item &Categories' => 'تصنيفات بنود المخزون',
				'Item Ta&x Types' => 'أنواع ضرائب البنود المخزنية',
				'Maintenance' => 'نماذج الأدخال الأساسية',
				'Manufacturing &Reports' => 'تقارير العمليات التصنيعية',
				'Miscellaneous' => 'متنوعة',
				'Pa&yment Terms' => 'شروط الدفع',
				'Pricing and Costs' => 'التسعير البيعي و التكاليفي',
				'Process &Depreciation' => 'معالجة الإهلاك',
				'Purchase &Order Entry' => 'إدخال أمر الشراء',
				'Purchase Orders &Inquiry' => 'الإستعلام عن أوامر الشراء',
				'Purchasing &Pricing' => 'التسعير الشرائي',
				'Recurrent &Invoices' => 'الفواتير الدورية',
				'Revenue / &Costs Accruals' => 'استحقاقات الإيراد/التكاليف',
				'Sales &Areas' => 'مناطق البيع',
				'Sales &Groups' => 'مجموعات المبيعات',
				'Sales &Kits' => 'أدوات البيع',
				'Sales &Order Entry' => 'إدخال طلبات البيع',
				'Sales &Persons' => 'مندوبين المبيعات',
				'Sales &Pricing' => 'التسعير البيعي',
				'Sales &Quotation Entry' => 'إدخال عروض الأسعار',
				'Sales Order &Inquiry' => 'الإستعلام عن طلبات المبيعات',
				'Sales Quotation I&nquiry' => 'الإستعلام عن حركات تخصيص الدفعات و الإشعارات الدائنة للمورد',
				'Sales T&ypes' => 'أنواع المبيعات',
				'Shi&pping Company' => 'شركة الشحن',
				'Software &Upgrade' => 'تحديث البرنامج',
				'Standard &Costs' => 'التكاليف المعيارية',
				'Supplier &Credit Notes' => 'الإشعارات الدائنة للموردين',
				'Supplier &Invoices' => 'فواتير الموردين',
				'Supplier Allocation &Inquiry' => 'الإستعلام عن حركات تخصيص الدفعات و الإشعارات الدائنة للمورد',
				'Supplier Transaction &Inquiry' => 'الإستعلام عن الحركات الخاصة بالمورد',
				'Supplier and Purchasing &Reports' => 'تقارير الموردين و المشتريات',
				'System &Diagnostics' => 'تشخيصات النظام',
				'System and &General GL Setup' => 'إعدادات النظام و اليومية العامة',
				'Ta&x Inquiry' => 'الأستعلام عن الضريبة',
				'Tax &Groups' => 'مجموعات الضرائب',
				'Transaction &References' => 'مراجع العمليات',
				'Transactions' => 'الحركات',
				'Trial &Balance' => 'ميزان المراجعة',
				'View or &Print Transactions' => 'عرض أو طباعة الحركات',
				'Work &Order Entry' => 'إدخال أوامر التشغيل',
				'Work Order &Inquiry' => 'الاستعلام عن أوامر التشغيل',
				);
			}
			$key = trim($name);
			if (isset($map[$key]))
				return $map[$key];
			// جرّب بدون & (قد تكون الأسماء مخزنة بدونها)
			$key2 = str_replace('&', '', $key);
			foreach ($map as $k => $v)
			{
				if (str_replace('&', '', $k) === $key2)
					return $v;
			}
			// جرّب الترجمة العادية ثم نظّف &
			return str_replace('&', '', _($name));
		}

		function display_applications(&$waapp)
		{
			global $path_to_root;

			$selected_app = $waapp->get_selected_application();
			if (!$_SESSION["wa_current_user"]->check_application_access($selected_app))
				return;

			if (method_exists($selected_app, 'render_index'))
			{
				$selected_app->render_index();
				return;
			}

			// ===== غرفة قيادة قيد: مؤشرات حية =====
			echo $this->qayd_kpis();

			echo "<div class='qayd-modules'>";
			foreach ($selected_app->modules as $module)
			{
				if (!$_SESSION["wa_current_user"]->check_module_access($module))
					continue;
				echo "<div class='qayd-module'>";
				// اسم عربي مباشر للوحدة
				$mod_name = $this->qayd_ar_name($module->name);
				echo "<div class='qayd-module-head'>" . $mod_name . "</div>";
				echo "<div class='qayd-tiles'>";
				$funcs = array_merge($module->lappfunctions, $module->rappfunctions);
				foreach ($funcs as $appfunction)
				{
					if ($appfunction->label == "")
						continue;
					if ($_SESSION["wa_current_user"]->can_access_page($appfunction->access))
					{
						$lbl = $this->qayd_ar_name($appfunction->label);
						$url = $path_to_root . "/" . $appfunction->link;
						echo "<a class='qayd-tile' href='$url'><span class='qayd-tile-tx'>$lbl</span></a>";
					}
				}
				echo "</div></div>";
			}
			echo "</div>";
  		}
	}
