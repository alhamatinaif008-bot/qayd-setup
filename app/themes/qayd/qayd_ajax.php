<?php
/* ==========================================================================
   QAYD AJAX endpoint — بحث الأصناف والعملاء للقوائم المنبثقة
   ========================================================================== */
$path_to_root = "../..";
$page_security = 'SA_OPEN';
include_once($path_to_root . "/includes/session.inc");

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['wa_current_user'])) {
	echo json_encode(array('error' => 'not_logged_in'));
	exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$q = isset($_GET['q']) ? $_GET['q'] : '';
$q_esc = db_escape('%' . $q . '%');
$tb = TB_PREF;
$out = array();

if ($action === 'items') {
	$sql = "SELECT stock_id, description, units FROM {$tb}stock_master"
		. " WHERE inactive=0 AND mb_flag!='F'"
		. " AND (stock_id LIKE $q_esc OR description LIKE $q_esc)"
		. " ORDER BY stock_id LIMIT 50";
	$res = db_query($sql);
	while ($row = db_fetch($res)) {
		$out[] = array(
			'value' => $row['stock_id'],
			'text' => $row['stock_id'] . ' - ' . $row['description'],
			'units' => $row['units']
		);
	}
} elseif ($action === 'customers') {
	$sql = "SELECT debtor_no, debtor_ref, name FROM {$tb}debtors_master"
		. " WHERE inactive=0"
		. " AND (name LIKE $q_esc OR debtor_ref LIKE $q_esc)"
		. " ORDER BY name LIMIT 50";
	$res = db_query($sql);
	while ($row = db_fetch($res)) {
		$out[] = array(
			'value' => $row['debtor_no'],
			'text' => $row['debtor_ref'] . ' - ' . $row['name']
		);
	}
} elseif ($action === 'suppliers') {
	$sql = "SELECT supplier_id, supp_ref, supp_name FROM {$tb}suppliers"
		. " WHERE inactive=0"
		. " AND (supp_name LIKE $q_esc OR supp_ref LIKE $q_esc)"
		. " ORDER BY supp_name LIMIT 50";
	$res = db_query($sql);
	while ($row = db_fetch($res)) {
		$out[] = array(
			'value' => $row['supplier_id'],
			'text' => $row['supp_ref'] . ' - ' . $row['supp_name']
		);
	}
} elseif ($action === 'gl_accounts') {
	$sql = "SELECT account_code, account_name FROM {$tb}chart_master"
		. " WHERE inactive=0"
		. " AND (account_code LIKE $q_esc OR account_name LIKE $q_esc)"
		. " ORDER BY account_code LIMIT 50";
	$res = db_query($sql);
	while ($row = db_fetch($res)) {
		$out[] = array(
			'value' => $row['account_code'],
			'text' => $row['account_code'] . ' - ' . $row['account_name']
		);
	}
} elseif ($action === 'bank_accounts') {
	$sql = "SELECT id, bank_account_name, bank_curr_code FROM {$tb}bank_accounts"
		. " WHERE inactive=0"
		. " AND bank_account_name LIKE $q_esc"
		. " ORDER BY bank_account_name LIMIT 50";
	$res = db_query($sql);
	while ($row = db_fetch($res)) {
		$out[] = array(
			'value' => $row['id'],
			'text' => $row['bank_account_name'] . ' (' . $row['bank_curr_code'] . ')'
		);
	}
} elseif ($action === 'locations') {
	$sql = "SELECT loc_code, location_name FROM {$tb}locations"
		. " WHERE inactive=0"
		. " AND (loc_code LIKE $q_esc OR location_name LIKE $q_esc)"
		. " ORDER BY location_name LIMIT 50";
	$res = db_query($sql);
	while ($row = db_fetch($res)) {
		$out[] = array(
			'value' => $row['loc_code'],
			'text' => $row['location_name']
		);
	}
} elseif ($action === 'price') {
	// سعر الصنف للعميل/عملة الفاتورة
	$stock_id = db_escape($_GET['stock_id']);
	$sql = "SELECT price FROM {$tb}prices WHERE stock_id=$stock_id ORDER BY sales_type_id LIMIT 1";
	$res = db_query($sql);
	$row = db_fetch($res);
	$out = array('price' => $row ? (float)$row['price'] : 0);
}

echo json_encode($out);
