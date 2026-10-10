import { useEffect, useState } from 'react';
import { Save, ShieldCheck, RefreshCw, Globe, Lock } from 'lucide-react';
import { fetchSettings, updateSetting, type SystemSetting } from '../../../services/settingsService';
import { useToast } from '../../../stores/toastStore';

export default function SettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      setSettings(data || []);
      setDrafts(Object.fromEntries((data || []).map((s) => [s.key, s.value])));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (setting: SystemSetting) => {
    const value = drafts[setting.key];
    if (value === undefined || value.trim() === '') {
      toast.error('Giá trị cấu hình không được để trống.');
      return;
    }
    if (setting.valueType === 'NUMBER' && Number.isNaN(Number(value.trim()))) {
      toast.error('Giá trị phải là số.');
      return;
    }
    if (setting.valueType === 'BOOLEAN' && !['true', 'false'].includes(value.trim().toLowerCase())) {
      toast.error('Giá trị phải là true/false.');
      return;
    }
    setSavingKey(setting.key);
    try {
      const updated = await updateSetting(setting.key, {
        value: value.trim(),
        description: setting.description || undefined,
        isPublic: setting.isPublic,
      });
      setSettings((prev) => prev.map((s) => (s.key === updated.key ? updated : s)));
      toast.success(`Đã lưu cấu hình "${updated.key}".`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu cấu hình');
    } finally {
      setSavingKey(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'NUMBER': return 'Số';
      case 'BOOLEAN': return 'Đúng/Sai';
      default: return 'Chuỗi';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#c2410c]"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
            <p className="text-xs text-stone-500">Chính sách vận hành và cấu hình hệ thống — lưu ở bảng system_settings</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
        >
          <RefreshCw className="h-4 w-4" /> Tải lại
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-bold text-stone-900">Cấu hình hệ thống ({settings.length})</h2>
          <span className="text-xs text-stone-400">Chỉnh giá trị rồi bấm lưu cho từng dòng</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-stone-500">Đang tải dữ liệu...</div>
        ) : settings.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">Chưa có cấu hình nào trong hệ thống.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {settings.map((s) => (
              <div key={s.key} className="p-4 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_auto] gap-3 items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-800">{s.key}</code>
                    <span className="rounded bg-stone-50 border border-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-500">
                      {getTypeLabel(s.valueType)}
                    </span>
                    {s.isPublic ? (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        <Globe className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-stone-50 border border-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-500">
                        <Lock className="h-3 w-3" /> Nội bộ
                      </span>
                    )}
                  </div>
                  {s.description && <p className="mt-1 text-xs text-stone-500">{s.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {s.valueType === 'BOOLEAN' ? (
                    <select
                      value={drafts[s.key] ?? s.value}
                      onChange={(e) => setDrafts({ ...drafts, [s.key]: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs text-stone-700 focus:border-[#c2410c] focus:outline-none"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input
                      type={s.valueType === 'NUMBER' ? 'number' : 'text'}
                      value={drafts[s.key] ?? s.value}
                      onChange={(e) => setDrafts({ ...drafts, [s.key]: e.target.value })}
                      className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-[#c2410c] focus:outline-none"
                    />
                  )}
                </div>
                <button
                  onClick={() => handleSave(s)}
                  disabled={savingKey === s.key || drafts[s.key] === s.value}
                  className="flex items-center gap-1.5 rounded bg-[#c2410c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#ea580c] transition disabled:opacity-40 disabled:hover:bg-[#c2410c]"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingKey === s.key ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
