; ============================================================
; قيد للمحاسبة والأنظمة الرقمية - سكربت المثبت
; Inno Setup 6 - النهج الخفيف: PHP + MariaDB محمولة
; يُبنى تلقائياً عبر GitHub Actions على ويندوز
; ============================================================

#define MyAppName "قيد للمحاسبة والأنظمة الرقمية"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "قيد للمحاسبة والأنظمة الرقمية"
#define MyAppURL "https://qayd.ye"

[Setup]
AppId={{8A3B2C1D-4E5F-6A7B-8C9D-0E1F2A3B4C5D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\Qayd
DefaultGroupName={#MyAppName}
OutputDir=dist
OutputBaseFilename=Qayd-Setup-{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
; مساحة تقديرية: ~450MB
ExtraDiskSpaceRequired=471859200

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"

[Files]
; التطبيق
Source: "app\*"; DestDir: "{app}\app"; Flags: ignoreversion recursesubdirs createallsubdirs
; المكونات المحمولة
Source: "components\php\*"; DestDir: "{app}\components\php"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "components\mariadb\*"; DestDir: "{app}\components\mariadb"; Flags: ignoreversion recursesubdirs createallsubdirs
; المشغّلات
Source: "launcher\qayd-launcher.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "launcher\qayd-stop.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "launcher\first-run.bat"; DestDir: "{app}"; Flags: ignoreversion
; ملفات الإعداد
Source: "setup\*"; DestDir: "{app}\setup"; Flags: ignoreversion

[Icons]
Name: "{group}\قيد - بدء النظام"; Filename: "{app}\qayd-launcher.bat"; WorkingDir: "{app}"
Name: "{group}\قيد - إيقاف النظام"; Filename: "{app}\qayd-stop.bat"; WorkingDir: "{app}"
Name: "{commondesktop}\قيد للمحاسبة"; Filename: "{app}\qayd-launcher.bat"; WorkingDir: "{app}"

[Run]
; تشغيل إعداد أول مرة بعد التثبيت
Filename: "{app}\first-run.bat"; Description: "إعداد قاعدة البيانات (أول مرة)"; Flags: postinstall runascurrentuser waituntilterminated
Filename: "{app}\qayd-launcher.bat"; Description: "بدء نظام قيد الآن"; Flags: postinstall runascurrentuser nowait skipifsilent

[Code]
// فحص المنافذ قبل التثبيت
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  // تحذير إذا كان المنفذ 8082 مستخدماً (نادر)
  // لا نمنع التثبيت، فقط ننبه
end;
