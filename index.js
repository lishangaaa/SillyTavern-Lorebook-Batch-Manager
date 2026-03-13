// 世界书批量管理 - 酒馆助手脚本 v2.5.1
// 作者：离殇

const VERSION = 'v2.5.1.1';
const CHUNK_SIZE = 50;

const STYLE = `
<style>
@keyframes wb-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes wb-fadeInScale { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
@keyframes wb-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
@keyframes wb-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes wb-glow { 0%, 100% { box-shadow: 0 0 8px rgba(91,192,222,0.15); } 50% { box-shadow: 0 0 16px rgba(91,192,222,0.3); } }
@keyframes wb-slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }

/* === 根容器 === */
.wb-manager-container {
  font-family: var(--mainFontFamily, -apple-system, 'Segoe UI', 'Noto Sans SC', sans-serif);
  display: flex; flex-direction: column; gap: 14px;
  max-height: 72vh; overflow-x: hidden; overflow-y: auto;
  overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
  width: 100%; box-sizing: border-box;
  animation: wb-fadeIn 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  padding: 2px;
}
.wb-manager-container::-webkit-scrollbar { width: 9px; }
.wb-manager-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.45); }
.wb-manager-container::-webkit-scrollbar-thumb { background: rgba(140,160,180,0.7); border-radius: 6px; }
.wb-manager-container::-webkit-scrollbar-thumb:hover { background: rgba(140,160,180,0.9); }

/* === 头部 === */
.wb-header {
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  padding: 16px 20px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(91,192,222,0.08) 0%, rgba(129,199,132,0.05) 50%, rgba(33,150,243,0.06) 100%);
  border: 1px solid rgba(91,192,222,0.12);
  position: relative; overflow: hidden;
}
.wb-header::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(91,192,222,0.5), rgba(129,199,132,0.4), transparent);
}
.wb-header h3 {
  margin: 0; font-size: 17px; font-weight: 700;
  color: var(--SmartThemeBodyColor, #eee);
  letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.wb-version {
  font-size: 10px; font-weight: 600;
  color: rgba(91,192,222,0.8);
  background: rgba(91,192,222,0.08);
  padding: 3px 10px; border-radius: 20px;
  letter-spacing: 0.8px;
  border: 1px solid rgba(91,192,222,0.15);
  text-transform: uppercase;
}

/* === 标签栏 === */
.wb-tab-bar {
  display: flex; gap: 3px;
  background: rgba(0,0,0,0.2);
  border-radius: 10px; padding: 4px;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.04);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.wb-tab {
  flex: 1; text-align: center; padding: 10px 16px;
  cursor: pointer; border-radius: 8px;
  color: var(--SmartThemeQuoteColor, #888);
  font-size: 13px; font-weight: 600;
  transition: all 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  white-space: nowrap; user-select: none; -webkit-user-select: none;
  position: relative;
}
.wb-tab:hover { color: var(--SmartThemeBodyColor, #ccc); background: rgba(255,255,255,0.03); }
.wb-tab.active {
  color: var(--SmartThemeBodyColor, #fff);
  background: linear-gradient(135deg, rgba(91,192,222,0.12), rgba(33,150,243,0.08));
  box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
  border: 1px solid rgba(91,192,222,0.15);
}

/* === 标签页内容 === */
.wb-tab-content { display: none; }
.wb-tab-content.wb-tab-visible {
  display: flex; flex-direction: column; flex: 1 1 auto;
  min-height: 0; gap: 10px;
  animation: wb-fadeInScale 0.2s ease;
}
.wb-tab-content > .wb-manager-section, .wb-tab-content > .wb-toolbar,
.wb-tab-content > .wb-section-label, .wb-tab-content > .wb-op-tabs { flex-shrink: 0; }

/* === 表单区块 === */
.wb-manager-section { display: flex; flex-direction: column; gap: 8px; }
.wb-manager-section label, .wb-section-label {
  font-weight: 700; font-size: 12px;
  color: var(--SmartThemeQuoteColor, #999);
  text-transform: uppercase; letter-spacing: 1px;
}
.wb-manager-select {
  padding: 11px 14px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.25);
  color: var(--SmartThemeBodyColor, #ccc);
  font-size: 14px; cursor: pointer;
  width: 100%; box-sizing: border-box;
  transition: all 0.2s ease;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  padding-right: 36px;
}
.wb-manager-select:focus {
  border-color: rgba(91,192,222,0.4); outline: none;
  box-shadow: 0 0 0 3px rgba(91,192,222,0.08);
}

/* === 条目列表容器 === */
.wb-manager-entries-list {
  max-height: 42vh; overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  background: rgba(0,0,0,0.12);
  will-change: scroll-position; overscroll-behavior: contain;
}
.wb-manager-entries-list::-webkit-scrollbar { width: 8px; }
.wb-manager-entries-list::-webkit-scrollbar-track { background: transparent; }
.wb-manager-entries-list::-webkit-scrollbar-thumb { background: rgba(91,192,222,0.3); border-radius: 6px; }
.wb-manager-entries-list::-webkit-scrollbar-thumb:hover { background: rgba(91,192,222,0.45); }
#wb-entries-container { flex: 1 1 auto; min-height: 0; }

/* === 条目卡片 === */
.wb-entry-wrapper {
  border-bottom: 1px solid rgba(255,255,255,0.03);
  border-left: 3px solid transparent;
  transition: all 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  contain: layout style;
}
.wb-entry-wrapper:last-of-type { border-bottom: none; }
.wb-entry-wrapper:hover { background: rgba(255,255,255,0.015); }
.wb-entry-wrapper.wb-selected {
  background: linear-gradient(90deg, rgba(91,192,222,0.06), transparent);
  border-left-color: #5bc0de;
}
.wb-entry-wrapper.wb-selected .wb-entry-name { color: #7dd3e8; }

.wb-entry-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px; min-height: 44px;
  transition: background 0.15s ease;
  cursor: pointer; user-select: none; -webkit-user-select: none;
  box-sizing: border-box;
}
.wb-entry-item:hover { background: rgba(255,255,255,0.02); }
.wb-entry-item:active { background: rgba(255,255,255,0.04); }

.wb-entry-item input[type="checkbox"] {
  margin-top: 3px; cursor: pointer;
  accent-color: #5bc0de;
  width: 16px; height: 16px; flex-shrink: 0;
  border-radius: 4px;
  transition: transform 0.15s ease;
}
.wb-entry-item input[type="checkbox"]:checked { transform: scale(1.1); }

.wb-entry-info {
  display: flex; flex-direction: column; gap: 3px;
  flex: 1; min-width: 0; overflow: hidden;
}
.wb-entry-name {
  font-weight: 600; font-size: 13px;
  color: var(--SmartThemeBodyColor, #e0e0e0);
  word-break: break-word;
  transition: color 0.2s ease;
  line-height: 1.4;
}
.wb-entry-uid {
  font-size: 11px; color: var(--SmartThemeQuoteColor, #666);
  font-family: var(--monoFontFamily, 'JetBrains Mono', 'Consolas', monospace);
  letter-spacing: 0.3px;
}
.wb-entry-keys {
  font-size: 11px; color: #8e99a4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  padding: 2px 0;
}
.wb-entry-content-preview {
  font-size: 12px;
  color: rgba(255,255,255,0.58);
  max-height: 34px; overflow: hidden; text-overflow: ellipsis;
  word-break: break-word; line-height: 1.55;
}

/* === 预览按钮 === */
.wb-preview-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.06);
  color: var(--SmartThemeQuoteColor, #666);
  cursor: pointer; font-size: 14px;
  padding: 4px 8px; border-radius: 8px;
  flex-shrink: 0; transition: all 0.2s ease;
  line-height: 1; min-width: 32px; min-height: 28px;
  display: flex; align-items: center; justify-content: center;
}
.wb-preview-btn:hover {
  background: rgba(33,150,243,0.08);
  color: #90caf9;
  border-color: rgba(33,150,243,0.2);
}
.wb-preview-btn.active {
  background: rgba(33,150,243,0.12);
  color: #64b5f6;
  border-color: rgba(33,150,243,0.3);
  box-shadow: 0 0 8px rgba(33,150,243,0.1);
}

/* === 状态徽章 === */
.wb-entry-status {
  font-size: 10px; padding: 3px 10px; border-radius: 20px;
  flex-shrink: 0; white-space: nowrap;
  font-weight: 600; letter-spacing: 0.3px;
  border: 1px solid transparent;
}
.wb-entry-status.st-enabled {
  background: rgba(76,175,80,0.1); color: #81c784;
  border-color: rgba(76,175,80,0.15);
}
.wb-entry-status.st-disabled {
  background: rgba(244,67,54,0.08); color: #e57373;
  border-color: rgba(244,67,54,0.12);
}
.wb-entry-status.st-constant {
  background: rgba(33,150,243,0.1); color: #64b5f6;
  border-color: rgba(33,150,243,0.15);
}

/* === 预览面板 === */
.wb-preview-panel {
  display: none;
  background: linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.15));
  border-top: 1px solid rgba(255,255,255,0.04);
  padding: 14px 16px 16px 52px;
}
.wb-preview-meta {
  display: flex; flex-wrap: wrap; gap: 6px 20px;
  margin-bottom: 10px; font-size: 11px;
  padding: 8px 12px; border-radius: 8px;
  background: rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.03);
}
.wb-preview-meta-item { display: flex; gap: 6px; align-items: center; }
.wb-preview-meta-label {
  color: #555; flex-shrink: 0; font-weight: 600;
  text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;
}
.wb-preview-meta-value {
  color: var(--SmartThemeBodyColor, #bbb);
  word-break: break-all;
}
.wb-preview-content-box {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 10px; padding: 14px 16px;
  max-height: 280px; overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}
.wb-preview-content-box::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(91,192,222,0.15), transparent);
}
.wb-preview-content-box::-webkit-scrollbar { width: 4px; }
.wb-preview-content-box::-webkit-scrollbar-thumb { background: rgba(91,192,222,0.1); border-radius: 4px; }
.wb-preview-content-text {
  font-size: 12px; color: var(--SmartThemeBodyColor, #d0d0d0);
  white-space: pre-wrap; word-break: break-word;
  line-height: 1.6;
  font-family: var(--monoFontFamily, 'JetBrains Mono', 'Consolas', monospace);
  margin: 0;
}
.wb-preview-empty { color: #444; font-style: italic; }

/* === 工具栏 === */
.wb-toolbar {
  display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
  padding: 6px 0;
}
.wb-toolbar button {
  padding: 7px 14px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: var(--SmartThemeBodyColor, #bbb);
  cursor: pointer; font-size: 12px; font-weight: 500;
  transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  white-space: nowrap; min-height: 34px;
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
.wb-toolbar button:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.wb-toolbar button:active { transform: translateY(0) scale(0.98); }
.wb-toolbar button:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

.wb-toolbar button.danger {
  background: rgba(244,67,54,0.08);
  border-color: rgba(244,67,54,0.2);
  color: #ef9a9a;
}
.wb-toolbar button.danger:hover:not(:disabled) {
  background: rgba(244,67,54,0.18);
  border-color: rgba(244,67,54,0.4);
  box-shadow: 0 2px 10px rgba(244,67,54,0.15);
}
.wb-toolbar button.danger.wb-has-selection {
  animation: wb-glow 2s ease-in-out infinite;
  border-color: rgba(244,67,54,0.4);
  background: rgba(244,67,54,0.12);
}
.wb-toolbar-sep {
  width: 1px; height: 18px;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent);
  flex-shrink: 0; margin: 0 3px;
}

/* === 搜索输入 === */
.wb-filter-input {
  padding: 8px 12px 8px 32px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.2);
  color: var(--SmartThemeBodyColor, #ccc);
  font-size: 12px; flex: 1 1 auto;
  min-width: 130px; box-sizing: border-box;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: 10px center;
}
.wb-filter-input:focus {
  border-color: rgba(91,192,222,0.35); outline: none;
  box-shadow: 0 0 0 3px rgba(91,192,222,0.06);
  background-color: rgba(0,0,0,0.3);
}
.wb-filter-input::placeholder { color: #444; }

/* === 计数器 & 徽章 === */
.wb-counter {
  font-size: 11px; color: var(--SmartThemeQuoteColor, #777);
  white-space: nowrap;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  background: rgba(0,0,0,0.15); padding: 4px 10px; border-radius: 20px;
}
.wb-selected-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: linear-gradient(135deg, rgba(239,154,154,0.1), rgba(244,67,54,0.08));
  color: #ef9a9a; padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; white-space: nowrap;
  border: 1px solid rgba(239,154,154,0.12);
}
.wb-selected-badge:empty { padding: 0; background: transparent; border: none; }

/* === 空状态 & 加载 === */
.wb-empty-msg {
  text-align: center; padding: 36px 16px;
  color: #555; font-size: 14px;
  border-radius: 12px;
  background: rgba(0,0,0,0.08);
  border: 1px dashed rgba(255,255,255,0.06);
}
.wb-loading {
  background: linear-gradient(90deg, rgba(0,0,0,0.08), rgba(91,192,222,0.04), rgba(0,0,0,0.08));
  background-size: 200% 100%;
  animation: wb-shimmer 2s ease-in-out infinite, wb-pulse 1.5s ease-in-out infinite;
}
.wb-load-sentinel {
  text-align: center; padding: 16px 12px;
  color: #444; font-size: 12px;
  border-top: 1px solid rgba(255,255,255,0.03);
  font-style: italic;
}

/* === 世界书列表项 === */
.wb-book-item {
  border-left: 3px solid transparent;
  transition: all 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.wb-book-item:hover { background: rgba(255,255,255,0.02); }
.wb-book-item.wb-selected {
  background: linear-gradient(90deg, rgba(91,192,222,0.06), transparent);
  border-left-color: #5bc0de;
}
.wb-book-item.wb-selected .wb-entry-name { color: #7dd3e8; }

.wb-no-match-msg {
  text-align: center; padding: 24px 12px;
  color: #555; font-size: 13px; display: none;
  font-style: italic;
}

/* === 操作标签栏 === */
.wb-op-tabs {
  display: flex; gap: 0;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; overflow: hidden;
  flex-shrink: 0; position: relative; z-index: 2;
  background: rgba(0,0,0,0.4);
}
.wb-op-tab {
  flex: 1; text-align: center; padding: 9px 12px;
  cursor: pointer; color: var(--SmartThemeQuoteColor, #777);
  font-size: 12px; font-weight: 600;
  transition: all 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  border-right: 1px solid rgba(255,255,255,0.04);
  white-space: nowrap; user-select: none;
  position: relative;
}
.wb-op-tab:last-child { border-right: none; }
.wb-op-tab:hover {
  color: var(--SmartThemeBodyColor, #ccc);
  background: rgba(255,255,255,0.03);
}
.wb-op-tab.active {
  color: var(--SmartThemeBodyColor, #fff);
  background: linear-gradient(135deg, rgba(91,192,222,0.1), rgba(33,150,243,0.06));
}
.wb-op-tab.active::after {
  content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(91,192,222,0.6), transparent);
  border-radius: 2px;
}

/* === 操作面板 === */
.wb-op-panel {
  display: none; flex-direction: column; gap: 10px;
  padding: 12px 14px; flex-shrink: 0;
  position: relative; z-index: 2;
  border-radius: 10px;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.08);
}
.wb-op-panel.wb-op-visible {
  display: flex;
  animation: wb-fadeInScale 0.2s ease;
}

.wb-op-row {
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
}
.wb-op-label {
  font-size: 12px; color: var(--SmartThemeBodyColor, #bbb);
  white-space: nowrap; min-width: 48px;
  font-weight: 600;
}
.wb-op-input {
  flex: 1; min-width: 100px; padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.2);
  color: var(--SmartThemeBodyColor, #ccc);
  font-size: 12px; box-sizing: border-box;
  transition: all 0.2s ease;
}
.wb-op-input:focus {
  border-color: rgba(91,192,222,0.3); outline: none;
  box-shadow: 0 0 0 2px rgba(91,192,222,0.06);
}
.wb-op-select {
  padding: 8px 12px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.25);
  color: var(--SmartThemeBodyColor, #ccc);
  font-size: 12px; cursor: pointer;
  transition: all 0.2s ease;
}
.wb-op-select:focus {
  border-color: rgba(91,192,222,0.3); outline: none;
}
.wb-op-btn {
  padding: 8px 16px; border-radius: 8px;
  border: 1px solid rgba(91,192,222,0.2);
  background: linear-gradient(135deg, rgba(91,192,222,0.08), rgba(33,150,243,0.06));
  color: #90caf9; cursor: pointer;
  font-size: 12px; font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.wb-op-btn:hover {
  background: linear-gradient(135deg, rgba(91,192,222,0.15), rgba(33,150,243,0.12));
  border-color: rgba(91,192,222,0.35);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(91,192,222,0.1);
}
.wb-op-btn:active { transform: translateY(0) scale(0.98); }
.wb-op-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

.wb-op-result {
  font-size: 12px; color: var(--SmartThemeQuoteColor, #888);
  flex: 1 1 100%; margin-top: 2px;
  padding: 4px 8px; border-radius: 6px;
  background: rgba(0,0,0,0.08);
}
.wb-op-result:empty { padding: 0; background: none; }
.wb-op-note {
  font-size: 11px; color: #555; font-style: italic;
  padding: 4px 0;
  border-top: 1px solid rgba(255,255,255,0.03);
}

/* === 复选框标签 === */
.wb-checkbox-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--SmartThemeBodyColor, #bbb);
  cursor: pointer; white-space: nowrap; user-select: none;
  padding: 2px 6px; border-radius: 6px;
  transition: background 0.15s ease;
}
.wb-checkbox-label:hover { background: rgba(255,255,255,0.03); }
.wb-checkbox-label input[type="checkbox"] {
  cursor: pointer; accent-color: #5bc0de;
}

/* === 触控优化 === */
.wb-tab, .wb-op-tab, .wb-entry-item, .wb-op-btn, .wb-toolbar button,
.wb-preview-btn, .wb-book-item {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* === 响应式 === */
@media (max-width: 600px) {
  .wb-manager-container { gap: 10px; max-height: 82vh; }
  .wb-header { padding: 12px 14px; border-radius: 10px; }
  .wb-header h3 { font-size: 15px; }
  .wb-tab { padding: 8px 10px; font-size: 12px; }
  .wb-toolbar { gap: 4px; }
  .wb-toolbar button { padding: 6px 10px; font-size: 11px; min-height: 32px; }
  .wb-toolbar-sep { height: 14px; margin: 0 1px; }
  .wb-filter-input {
    width: 100%; min-width: unset; flex-basis: 100%; order: 99;
    padding-left: 30px;
  }
  .wb-counter { flex-basis: 100%; text-align: right; order: 100; }
  .wb-entry-item { padding: 10px 10px; gap: 10px; }
  .wb-entry-name { font-size: 12px; }
  .wb-entry-uid, .wb-entry-keys, .wb-entry-content-preview { font-size: 10px; }
  .wb-preview-panel { padding: 10px 10px 12px 10px; }
  .wb-preview-content-box { max-height: 180px; }
  .wb-preview-btn { min-width: 36px; min-height: 32px; font-size: 15px; }
  .wb-preview-meta { gap: 4px 12px; font-size: 10px; padding: 6px 8px; }
  .wb-preview-content-text { font-size: 11px; }
  .wb-selected-badge { font-size: 11px; padding: 3px 8px; }
  .wb-manager-entries-list { max-height: 34vh; }
  .wb-op-tabs { border-radius: 8px; }
  .wb-op-tab { padding: 7px 6px; font-size: 11px; }
  .wb-op-panel { padding: 10px; border-radius: 8px; }
  .wb-op-row { gap: 5px; }
  .wb-op-input { min-width: 80px; font-size: 11px; padding: 7px 10px; }
  .wb-op-select { font-size: 11px; padding: 7px 10px; }
  .wb-op-btn { padding: 7px 12px; font-size: 11px; }
  .wb-op-label { font-size: 11px; min-width: 38px; }
  .wb-checkbox-label { font-size: 11px; }
}
</style>
`;

// --- 工具函数 ---

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/\\"/g,'&quot;').replace(/'/g,'&#39;');
}
function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function sanitizeFilename(n) {
  return String(n).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_');
}
function asArray(v) { return Array.isArray(v) ? v : []; }
function sortNames(list) {
  return [...asArray(list)].sort((a, b) =>
    String(a).localeCompare(String(b), 'zh-Hans-CN', { numeric: true, sensitivity: 'base' })
  );
}
function isRegExpLike(v) {
  return v instanceof RegExp || !!(v && typeof v === 'object' && typeof v.source === 'string');
}
function getKeywordText(v) {
  if (typeof v === 'string') return v;
  if (isRegExpLike(v)) return v.source || '';
  return String(v ?? '');
}
function rebuildKeywordValue(original, text) {
  if (typeof original === 'string') return text;
  if (original instanceof RegExp) {
    try { return new RegExp(text, original.flags); } catch (_) { return text; }
  }
  if (isRegExpLike(original)) {
    try { return new RegExp(text, original.flags || ''); } catch (_) { return text; }
  }
  return text;
}
function dedupeKeywordValues(list) {
  const out = [];
  const seen = new Set();
  for (const item of asArray(list)) {
    const text = getKeywordText(item).trim();
    if (!text) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(item);
  }
  return out;
}

// 将 TavernHelper 的 WorldbookEntry 标准化
function normalizeEntry(entry) {
  const strategy = entry.strategy || {};
  const position = entry.position || {};
  const extra = entry.extra || {};

  const keys = asArray(strategy.keys).map(getKeywordText).filter(Boolean);
  const keysSecondary = asArray(strategy.keys_secondary?.keys).map(getKeywordText).filter(Boolean);

  const isConstant = strategy.type === 'constant';
  const isSelective = strategy.type === 'selective';

  return {
    uid: entry.uid,
    name: entry.name || '',
    content: entry.content || '',
    enabled: entry.enabled,
    constant: isConstant,
    selective: isSelective,
    keys,
    keysSecondary,
    order: position.order ?? 0,
    depth: position.depth ?? 0,
    positionType: position.type,
    role: position.role,
    probability: entry.probability ?? 100,
    group: extra.group || '',
    groupWeight: extra.group_weight ?? 100,
    groupOverride: extra.group_override ?? false,
    _raw: entry,
  };
}

// 确保结构完整
function ensureEntryShape(entry) {
  entry.strategy = entry.strategy || {};
  entry.strategy.keys = Array.isArray(entry.strategy.keys) ? entry.strategy.keys : [];
  if (!entry.strategy.keys_secondary) {
    entry.strategy.keys_secondary = { logic: 'and_any', keys: [] };
  } else {
    entry.strategy.keys_secondary.keys = Array.isArray(entry.strategy.keys_secondary.keys)
      ? entry.strategy.keys_secondary.keys
      : [];
    entry.strategy.keys_secondary.logic = entry.strategy.keys_secondary.logic || 'and_any';
  }

  entry.position = entry.position || {};
  if (!entry.position.type) entry.position.type = 'at_depth';
  if (typeof entry.position.depth !== 'number') entry.position.depth = 0;
  if (typeof entry.position.order !== 'number') entry.position.order = 0;
  entry.position.role = entry.position.role || 'system';

  entry.extra = entry.extra || {};
  if (typeof entry.extra.group_weight !== 'number') entry.extra.group_weight = 100;
  if (typeof entry.extra.group_override !== 'boolean') entry.extra.group_override = false;
  if (entry.extra.caseSensitive === undefined) entry.extra.caseSensitive = null;
  if (entry.extra.matchWholeWords === undefined) entry.extra.matchWholeWords = null;
  if (entry.extra.useGroupScoring === undefined) entry.extra.useGroupScoring = null;

  entry.recursion = entry.recursion || {};
  if (typeof entry.recursion.prevent_incoming !== 'boolean') entry.recursion.prevent_incoming = false;
  if (typeof entry.recursion.prevent_outgoing !== 'boolean') entry.recursion.prevent_outgoing = false;
  if (entry.recursion.delay_until == null) entry.recursion.delay_until = 0;

  entry.effect = entry.effect || {};
  if (entry.effect.sticky == null) entry.effect.sticky = 0;
  if (entry.effect.cooldown == null) entry.effect.cooldown = 0;
  if (entry.effect.delay == null) entry.effect.delay = 0;
}

function getRawKeywordArray(entry, field) {
  ensureEntryShape(entry);
  return field === 'key'
    ? asArray(entry.strategy.keys)
    : asArray(entry.strategy.keys_secondary?.keys);
}
function setRawKeywordArray(entry, field, arr) {
  ensureEntryShape(entry);
  if (field === 'key') entry.strategy.keys = arr;
  else entry.strategy.keys_secondary.keys = arr;
}
function getFieldValue(entry, field) {
  switch (field) {
    case 'content':
      return entry.content || '';
    case 'key':
      if (Array.isArray(entry.keys)) return entry.keys.join(', ');
      return getRawKeywordArray(entry, 'key').map(getKeywordText).join(', ');
    case 'keysecondary':
      if (Array.isArray(entry.keysSecondary)) return entry.keysSecondary.join(', ');
      return getRawKeywordArray(entry, 'keysecondary').map(getKeywordText).join(', ');
    case 'comment':
      return entry.name || entry.comment || '';
    default:
      return '';
  }
}

// --- ST 世界书导入格式转换（字段级校准） ---

function worldbookEntriesToStImportableFile(entries) {
  const logicMap = {
    and_any: 0,
    not_all: 1,
    not_any: 2,
    and_all: 3,
  };

  const positionMap = {
    before_character_definition: 0,
    after_character_definition: 1,
    before_author_note: 2,
    after_author_note: 3,
    at_depth: 4,
    before_example_messages: 5,
    after_example_messages: 6,
    outlet: 7,
  };

  const roleMap = {
    system: 0,
    user: 1,
    assistant: 2,
  };

  const result = { entries: {} };
  const list = asArray(entries);

  list.forEach((entry, index) => {
    ensureEntryShape(entry);

    const strategy = entry.strategy || {};
    const position = entry.position || {};
    const recursion = entry.recursion || {};
    const effect = entry.effect || {};
    const extra = entry.extra || {};

    const stEntry = {
      uid: entry.uid,

      key: asArray(strategy.keys)
        .map(getKeywordText)
        .filter(Boolean),

      keysecondary: asArray(strategy.keys_secondary?.keys)
        .map(getKeywordText)
        .filter(Boolean),

      comment: entry.name || '',
      content: entry.content || '',

      constant: strategy.type === 'constant',
      vectorized: strategy.type === 'vectorized',
      selective: strategy.type !== 'vectorized',

      selectiveLogic: logicMap[strategy.keys_secondary?.logic || 'and_any'] ?? 0,

      addMemo: extra.addMemo !== undefined ? !!extra.addMemo : true,
      order: Number(position.order) || 0,
      position: positionMap[position.type] ?? 0,
      disable: !entry.enabled,

      ignoreBudget: !!extra.ignoreBudget,

      excludeRecursion: !!recursion.prevent_incoming,
      preventRecursion: !!recursion.prevent_outgoing,

      matchPersonaDescription: !!extra.matchPersonaDescription,
      matchCharacterDescription: !!extra.matchCharacterDescription,
      matchCharacterPersonality: !!extra.matchCharacterPersonality,
      matchCharacterDepthPrompt: !!extra.matchCharacterDepthPrompt,
      matchScenario: !!extra.matchScenario,
      matchCreatorNotes: !!extra.matchCreatorNotes,

      delayUntilRecursion: recursion.delay_until == null ? 0 : recursion.delay_until,

      probability: typeof entry.probability === 'number' ? entry.probability : 100,
      useProbability: true,

      depth: typeof position.depth === 'number' ? position.depth : 0,

      outletName: String(extra.outletName || ''),
      group: String(extra.group || ''),
      groupOverride: !!extra.group_override,
      groupWeight: typeof extra.group_weight === 'number' ? extra.group_weight : 100,

      scanDepth: strategy.scan_depth === 'same_as_global'
        ? null
        : (typeof strategy.scan_depth === 'number' ? strategy.scan_depth : null),

      caseSensitive: extra.caseSensitive ?? null,
      matchWholeWords: extra.matchWholeWords ?? null,
      useGroupScoring: extra.useGroupScoring ?? null,

      automationId: String(extra.automation_id || extra.automationId || ''),

      role: position.type === 'at_depth'
        ? (roleMap[position.role] ?? 0)
        : null,

      sticky: effect.sticky == null ? 0 : effect.sticky,
      cooldown: effect.cooldown == null ? 0 : effect.cooldown,
      delay: effect.delay == null ? 0 : effect.delay,

      triggers: Array.isArray(extra.triggers) ? extra.triggers : [],

      displayIndex: typeof extra.displayIndex === 'number' ? extra.displayIndex : index,

      characterFilter: extra.characterFilter || {
        isExclude: false,
        names: [],
        tags: [],
      },
    };

    result.entries[String(entry.uid)] = stEntry;
  });

  return result;
}

// --- 动态加载 JSZip ---

async function loadJSZip() {
  if (window.JSZip) return window.JSZip;
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = 'https://cdn.staticfile.net/jszip/3.10.1/jszip.min.js';
    script.onload = function () { resolve(window.JSZip); };
    script.onerror = function () { reject(new Error('JSZip 库加载失败')); };
    document.head.appendChild(script);
  });
}

// --- TavernHelper API 封装 ---

async function getWorldbookNames() { return TavernHelper.getWorldbookNames(); }
async function getWorldbook(bookName) { return TavernHelper.getWorldbook(bookName); }
async function deleteWorldbook(bookName) { return TavernHelper.deleteWorldbook(bookName); }
async function deleteWorldbookEntriesAPI(bookName, filterFn) {
  const result = await TavernHelper.deleteWorldbookEntries(bookName, (entry) => filterFn(entry));
  return { deleted_entries: result.deleted_entries || [] };
}

// --- 批量编辑统一入口 ---

async function batchOp(ctx, $btn, origText, entries, updateFn, successLabel) {
  if (!entries.length) {
    toastr.warning('没有可操作的条目（请先选中可见条目）');
    return null;
  }

  const bookName = ctx.currentBook;
  if (!bookName) {
    toastr.error('当前未选择世界书');
    return null;
  }

  ctx.setProcessing(true);
  $btn.prop('disabled', true);
  const total = entries.length;
  let changedCount = 0;

  try {
    $btn.text('⏳ 处理中…');

    const targetUids = new Set(entries.map(e => e.uid));

    await TavernHelper.updateWorldbookWith(bookName, (allEntries) => {
      const list = asArray(allEntries);
      for (const entry of list) {
        if (!targetUids.has(entry.uid)) continue;
        ensureEntryShape(entry);

        const before = JSON.stringify(entry);
        updateFn(entry);
        const after = JSON.stringify(entry);

        if (before !== after) changedCount++;
      }
      return list;
    });

    if (changedCount === 0) {
      toastr.info(`已检查 ${total} 个条目，未检测到需要修改的内容`);
    } else {
      toastr.success((successLabel || '操作') + `完成：实际修改 ${changedCount} / ${total} 个条目`);
    }
  } catch (e) {
    console.error('批量操作异常:', e);
    toastr.error('操作失败: ' + e.message);
  } finally {
    $btn.prop('disabled', false).text(origText);
    ctx.setProcessing(false);
  }

  await ctx.reloadEntries();
  return { ok: changedCount, total, unchanged: total - changedCount };
}

// --- 删除前备份确认（导出为 ST 可导入 JSON/ZIP）---

async function confirmDeleteWithBackup(title, count, prepareBackupFn, extraHtml) {
  const typeLabel = title.includes('世界书') ? '本' : '个';

  const askHtml =
    '<div style="text-align:center;">' +
      '<h3 style="color:#ef9a9a;margin-top:0;">' + title + '</h3>' +
      '<p style="color:#ddd;">准备删除 <b style="color:#ef9a9a;">' + count + '</b> ' + typeLabel + '数据。</p>' +
      (extraHtml || '') +
      '<div style="text-align:left;display:inline-block;background:rgba(0,0,0,0.2);padding:15px;border-radius:8px;">' +
        '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:12px;">' +
          '<input type="radio" name="wb-backup-choice" value="backup" checked style="width:18px;height:18px;">' +
          '<span style="color:#a5d6a7;font-size:14px;font-weight:bold;">💾 先下载备份（推荐）</span>' +
        '</label>' +
        '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">' +
          '<input type="radio" name="wb-backup-choice" value="nobackup" style="width:18px;height:18px;">' +
          '<span style="color:#ef9a9a;font-size:14px;">🗑️ 不备份，直接删除</span>' +
        '</label>' +
      '</div>' +
    '</div>';

  let userChoice = 'backup';

  const askResult = await SillyTavern.callGenericPopup(
    askHtml,
    SillyTavern.POPUP_TYPE.CONFIRM,
    '',
    {
      okButton: '下一步',
      cancelButton: '取消',
      allowVerticalScrolling: true,
      onOpen: async (pi) => {
        const $dlg = $(pi.dlg);
        $dlg.on('change', 'input[name="wb-backup-choice"]', function () {
          userChoice = $(this).val();
        });
      },
    }
  );
  if (askResult !== SillyTavern.POPUP_RESULT.AFFIRMATIVE) return 'cancel';

  if (userChoice === 'nobackup') {
    const warnHtml =
      '<div style="text-align:center;">' +
        '<h3 style="color:#ff9800;margin-top:0;">⚠️ 最终警告</h3>' +
        '<p style="color:#ef9a9a;font-weight:bold;">数据删除后将永久丢失，无法恢复。</p>' +
        '<p style="color:#ddd;">确认要继续删除吗？</p>' +
      '</div>';

    const warnResult = await SillyTavern.callGenericPopup(
      warnHtml,
      SillyTavern.POPUP_TYPE.CONFIRM,
      '',
      { okButton: '仍要删除', cancelButton: '取消' }
    );
    return warnResult === SillyTavern.POPUP_RESULT.AFFIRMATIVE ? 'ok' : 'cancel';
  }

  const $toast = toastr.info('正在打包备份数据...', '⏳', { timeOut: 0, extendedTimeOut: 0 });
  let backupBlob, backupFileName, isZip = false, jsonStr = '';
  try {
    const result = await prepareBackupFn();
    backupFileName = result.name;
    if (result.blob instanceof Blob) {
      backupBlob = result.blob;
      isZip = true;
    } else {
      jsonStr = JSON.stringify(result.data, null, 2);
      backupBlob = new Blob([jsonStr], { type: 'application/json' });
    }
  } catch (e) {
    toastr.clear($toast);
    toastr.error('备份打包失败: ' + e.message);
    return 'cancel';
  }
  toastr.clear($toast);

  const hasFilePicker = typeof window.showSaveFilePicker === 'function';
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  let canShareFile = false;
  if (isIOS && navigator.share && navigator.canShare) {
    try {
      const testFile = new File(['test'], 'test.json', { type: 'application/json' });
      canShareFile = navigator.canShare({ files: [testFile] });
    } catch (e) {
      canShareFile = false;
    }
  }

  let tipText;
  if (hasFilePicker && !isIOS) {
    tipText = '💡 点击保存后会弹出系统保存对话框，可自由选择保存位置和文件名。';
  } else if (isIOS && canShareFile) {
    tipText = '📱 点击保存后会弹出系统分享面板，请选择「保存到文件」。';
  } else {
    tipText = '📱 如果下载后文件名变乱码，请先复制上方文件名，保存时手动粘贴重命名。';
  }

  const fileTypeLabel = isZip ? '📦 ZIP 压缩包（每个 JSON 均可直接导入酒馆）' : '📄 JSON 世界书文件（可直接导入酒馆世界书）';
  const mimeType = isZip ? 'application/zip' : 'application/json';

  let hasSavedOnce = false;

  const dlHtml =
    '<div style="text-align:center;">' +
      '<h3 style="color:#a5d6a7;margin-top:0;">💾 备份已就绪</h3>' +
      '<p style="color:#888;font-size:12px;margin-top:-4px;margin-bottom:10px;">' + fileTypeLabel + '</p>' +
      '<p style="color:#aaa;font-size:12px;margin-bottom:4px;text-align:left;">📝 文件名（可修改，点击可全选复制）：</p>' +
      '<input class="wb-dl-fname" type="text" value="' + escapeHtml(backupFileName) + '" ' +
        'style="width:100%;box-sizing:border-box;padding:8px 10px;border-radius:6px;' +
        'border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);' +
        'color:#81c784;font-size:13px;font-weight:bold;font-family:monospace;margin-bottom:12px;">' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">' +
        '<button class="wb-dl-save" type="button" ' +
          'style="padding:14px;background:rgba(76,175,80,0.15);' +
          'border:2px solid rgba(76,175,80,0.4);color:#81c784;' +
          'border-radius:8px;font-size:15px;font-weight:bold;cursor:pointer;">' +
          '⬇️ 保存备份文件' +
        '</button>' +
        (isZip ? '' :
        '<button class="wb-dl-copy" type="button" ' +
          'style="padding:10px;background:rgba(255,152,0,0.12);' +
          'border:1px solid rgba(255,152,0,0.35);color:#ffb74d;' +
          'border-radius:8px;font-size:13px;font-weight:bold;cursor:pointer;">' +
          '📋 复制JSON到剪贴板（保底方案）' +
        '</button>') +
      '</div>' +
      '<p class="wb-dl-status" style="color:#81c784;font-size:12px;min-height:18px;margin:4px 0;"></p>' +
      '<div style="padding:8px;background:rgba(255,152,0,0.08);border-radius:6px;border:1px solid rgba(255,152,0,0.2);">' +
        '<p style="color:#aaa;font-size:11px;margin:0;">' + tipText + '</p>' +
      '</div>' +
      '<p style="color:#ef9a9a;font-size:12px;margin-top:12px;font-weight:bold;">' +
        '⚠️ 请务必确认备份文件已保存成功后，再点击「确认删除」</p>' +
    '</div>';

  const result = await SillyTavern.callGenericPopup(
    dlHtml,
    SillyTavern.POPUP_TYPE.CONFIRM,
    '',
    {
      okButton: '确认删除',
      cancelButton: '取消',
      allowVerticalScrolling: true,
      onOpen: async (pi) => {
        const $dlg = $(pi.dlg);

        $dlg.on('click', '.wb-dl-fname', function () { this.select(); });

        $dlg.on('click', '.wb-dl-save', async function () {
          const fname = $dlg.find('.wb-dl-fname').val() || backupFileName;
          const $status = $dlg.find('.wb-dl-status');
          const $btn = $(this);
          $btn.prop('disabled', true).text('⏳ 处理中...');
          let saved = false;

          if (!saved && hasFilePicker && !isIOS) {
            try {
              const handle = await window.showSaveFilePicker({
                suggestedName: fname,
                types: [{
                  description: isZip ? 'ZIP 压缩包' : 'JSON 文件',
                  accept: isZip ? { 'application/zip': ['.zip'] } : { 'application/json': ['.json'] },
                }],
              });
              const writable = await handle.createWritable();
              await writable.write(backupBlob);
              await writable.close();
              $status.css('color', '#81c784').text('✅ 文件已保存成功！');
              toastr.success('备份文件已保存');
              saved = true;
            } catch (e) {
              console.warn('[WB Manager] showSaveFilePicker 失败，降级:', e.name, e.message);
            }
          }

          if (!saved && isIOS && canShareFile) {
            try {
              const file = new File([backupBlob], fname, { type: mimeType, lastModified: Date.now() });
              await navigator.share({ title: '世界书备份', files: [file] });
              $status.css('color', '#81c784').text('✅ 文件已通过分享保存！');
              toastr.success('备份文件已保存');
              saved = true;
            } catch (e) {
              console.warn('[WB Manager] navigator.share 失败，降级:', e.name, e.message);
            }
          }

          if (!saved) {
            try {
              const url = URL.createObjectURL(backupBlob);
              const a = document.createElement('a');
              a.href = url; a.download = fname; a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              $status.css('color', '#81c784').text('✅ 已触发浏览器下载：' + fname);
              saved = true;
              setTimeout(function () {
                try { document.body.removeChild(a); } catch (x) {}
                try { URL.revokeObjectURL(url); } catch (x) {}
              }, 5000);
            } catch (e2) {
              $status.css('color', '#ef9a9a').text('❌ 下载失败，请尝试复制 JSON');
              console.error('[WB Manager] 下载失败:', e2);
            }
          }

          hasSavedOnce = hasSavedOnce || saved;
          $btn.prop('disabled', false).text(saved ? '⬇️ 再次保存' : '⬇️ 保存备份文件');
        });

        if (!isZip) {
          $dlg.on('click', '.wb-dl-copy', function () {
            const $status = $dlg.find('.wb-dl-status');
            function ok() {
              $status.css('color', '#81c784').text('✅ 已复制到剪贴板，请粘贴保存为 .json 文件');
              toastr.success('JSON 已复制到剪贴板');
              hasSavedOnce = true;
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(jsonStr).then(ok).catch(function () {
                doCopy();
              });
            } else {
              doCopy();
            }

            function doCopy() {
              const ta = document.createElement('textarea');
              ta.value = jsonStr;
              ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
              document.body.appendChild(ta);
              ta.select();
              try {
                document.execCommand('copy');
                ok();
              } catch (e) {
                $status.css('color', '#ef9a9a').text('❌ 复制失败，请手动保存');
                toastr.error('复制失败');
              }
              document.body.removeChild(ta);
            }
          });
        }
      },
    }
  );

  if (result !== SillyTavern.POPUP_RESULT.AFFIRMATIVE) return 'cancel';

  if (!hasSavedOnce) {
    toastr.warning('看起来你还没有保存任何备份，请先保存备份文件。');
    return 'cancel';
  }

  return 'ok';
}

// --- 绑定检测 ---

function findAssociatedCharacters(bookNames) {
  const a = {};
  try {
    const ctx = SillyTavern.getContext?.();
    if (!ctx?.characters) return a;
    const s = new Set(Array.isArray(bookNames) ? bookNames : [bookNames]);
    for (const c of ctx.characters) {
      const b =
        c?.data?.extensions?.world ||
        c?.data?.extensions?.worldbook ||
        c?.data?.world ||
        c?.worldbook ||
        '';
      if (b && s.has(b)) {
        if (!a[b]) a[b] = [];
        a[b].push(c.name || c.avatar || '未知角色');
      }
    }
  } catch (e) { console.warn('角色关联检测失败:', e); }
  return a;
}

async function getWorldbookBindingsInfo(bookNames) {
  const result = {};
  const names = Array.isArray(bookNames) ? bookNames : [bookNames];

  try {
    const globalNames = TavernHelper.getGlobalWorldbookNames();
    const globalSet = new Set(globalNames || []);
    const chatWorld = TavernHelper.getChatWorldbookName('current');

    const ctx = SillyTavern.getContext?.();
    const charBindings = {};
    if (ctx?.characters) {
      for (const c of ctx.characters) {
        const name = c.name || c.avatar;
        if (!name) continue;
        try {
          const wb = await TavernHelper.getCharWorldbookNames(name);
          const arr = [];
          if (wb?.primary) arr.push(wb.primary);
          if (Array.isArray(wb?.additional)) arr.push(...wb.additional);
          for (const w of arr) {
            if (!charBindings[w]) charBindings[w] = new Set();
            charBindings[w].add(name);
          }
        } catch (_) {}
      }
    }

    for (const bn of names) {
      result[bn] = {
        global: globalSet.has(bn),
        currentChat: chatWorld === bn,
        chars: charBindings[bn] ? Array.from(charBindings[bn]) : [],
      };
    }
  } catch (e) {
    console.warn('获取世界书绑定信息失败:', e);
  }

  return result;
}

function buildAssociationHTML(books, bindingsInfo) {
  const fallbackAssoc = findAssociatedCharacters(books);
  const assocChars = {};

  for (const bn of books) {
    const charsFromInfo = asArray(bindingsInfo?.[bn]?.chars);
    if (charsFromInfo.length) assocChars[bn] = charsFromInfo;
    else if (asArray(fallbackAssoc[bn]).length) assocChars[bn] = fallbackAssoc[bn];
  }

  const hasChar = Object.keys(assocChars).length > 0;

  let charHtml = '';
  if (hasChar) {
    const items = Object.entries(assocChars).map(([b, cs]) =>
      '<li style="padding:3px 0;">' +
        '📕 <span style="color:#ffcc80;font-weight:600;">' + escapeHtml(b) + '</span>' +
        ' <span style="color:#90caf9;">→</span> ' +
        cs.map(c => '<span style="color:#ff8a65;font-weight:bold;">' + escapeHtml(c) + '</span>').join('、') +
      '</li>'
    ).join('');
    charHtml =
      '<p style="color:#ffb74d;font-weight:bold;margin:0 0 6px;font-size:13px;">⚠️ 角色卡绑定信息：</p>' +
      '<ul style="margin:0;padding-left:18px;font-size:12px;list-style:none;">' + items + '</ul>';
  } else {
    charHtml =
      '<p style="color:#81c784;font-size:13px;margin:0 0 6px;">✅ 所选世界书无角色卡绑定</p>';
  }

  let otherHtml = '';
  if (bindingsInfo) {
    const rows = [];
    for (const bn of books) {
      const info = bindingsInfo[bn] || {};
      const flags = [];
      if (info.global) flags.push('🌍 全局启用');
      if (info.currentChat) flags.push('💬 当前聊天绑定');
      if (flags.length === 0) continue;

      rows.push(
        '<li style="padding:3px 0;">📕 <span style="color:#c5e1a5;">' + escapeHtml(bn) + '</span> — ' +
        flags.join(' / ') + '</li>'
      );
    }
    if (rows.length) {
      otherHtml =
        '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:8px 0;">' +
        '<p style="color:#ffcc80;font-size:12px;margin:0 0 4px;">以下世界书在其它位置仍被引用：</p>' +
        '<ul style="margin:0;padding-left:18px;font-size:12px;list-style:none;">' +
        rows.join('') + '</ul>' +
        '<p style="color:#ffcc80;font-size:11px;margin:6px 0 0;">⚠ 删除后对应位置将失去世界书绑定</p>';
    } else {
      otherHtml +=
        '<p style="color:#81c784;font-size:12px;margin:4px 0 0;">✅ 所选世界书未作为全局或当前聊天绑定</p>';
    }
  }

  return '<div style="background:rgba(255,152,0,0.08);border:1px solid rgba(255,152,0,0.25);' +
    'border-radius:8px;padding:10px 14px;margin:8px 0;text-align:left;">' +
    charHtml + otherHtml +
  '</div>';
}

// --- 条目 HTML ---

function buildSingleEntryHTML(entry, isSel) {
  const keys = (entry.keys||[]).filter(Boolean).join(', ');
  const keys2 = (entry.keysSecondary||[]).filter(Boolean).join(', ');
  const preview = (entry.content||'').substring(0,120).replace(/\n/g,' ');
  const full = entry.content||'';
  let sc, st;
  if (entry.constant) { sc='st-constant'; st='⚡ 常驻'; }
  else if (entry.enabled) { sc='st-enabled'; st='✓ 启用'; }
  else { sc='st-disabled'; st='✗ 禁用'; }
  const icon = entry.constant ? '⚡' : entry.selective ? '🎯' : '📄';
  const grp = entry.group ? ' · 组: ' + escapeHtml(entry.group) : '';

  return '<div class="wb-entry-wrapper ' + (isSel?'wb-selected':'') + '" data-uid="' + entry.uid + '">' +
    '<div class="wb-entry-item" data-uid="' + entry.uid + '" data-enabled="' + entry.enabled + '" data-constant="' + entry.constant + '">' +
      '<input type="checkbox" class="wb-entry-check" data-uid="' + entry.uid + '" ' + (isSel?'checked':'') + '>' +
      '<div class="wb-entry-info">' +
        '<span class="wb-entry-name">' + icon + ' ' + escapeHtml(entry.name||'(无标题)') + '</span>' +
        '<span class="wb-entry-uid">UID: ' + entry.uid + ' · 顺序: ' + entry.order + grp + '</span>' +
        (keys ? '<span class="wb-entry-keys">🔑 ' + escapeHtml(keys) + '</span>' : '') +
        (preview ? '<div class="wb-entry-content-preview">' + escapeHtml(preview) + (full.length>120?'…':'') + '</div>' : '') +
      '</div>' +
      '<button class="wb-preview-btn" title="预览完整内容">👁</button>' +
      '<span class="wb-entry-status ' + sc + '">' + st + '</span>' +
    '</div>' +
    '<div class="wb-preview-panel">' +
      '<div class="wb-preview-meta">' +
        '<div class="wb-preview-meta-item"><span class="wb-preview-meta-label">UID</span><span class="wb-preview-meta-value">' + entry.uid + '</span></div>' +
        '<div class="wb-preview-meta-item"><span class="wb-preview-meta-label">顺序</span><span class="wb-preview-meta-value">' + entry.order + '</span></div>' +
        '<div class="wb-preview-meta-item"><span class="wb-preview-meta-label">状态</span><span class="wb-preview-meta-value">' + (entry.constant?'常驻':entry.enabled?'启用':'禁用') + '</span></div>' +
        (entry.group ? '<div class="wb-preview-meta-item"><span class="wb-preview-meta-label">组</span><span class="wb-preview-meta-value">' + escapeHtml(entry.group) + ' (权重:' + entry.groupWeight + (entry.groupOverride?' 覆盖':'') + ')</span></div>' : '') +
        (keys ? '<div class="wb-preview-meta-item"><span class="wb-preview-meta-label">主键</span><span class="wb-preview-meta-value">' + escapeHtml(keys) + '</span></div>' : '') +
        (keys2 ? '<div class="wb-preview-meta-item"><span class="wb-preview-meta-label">次键</span><span class="wb-preview-meta-value">' + escapeHtml(keys2) + '</span></div>' : '') +
      '</div>' +
      '<div class="wb-preview-content-box">' +
        (full ? '<pre class="wb-preview-content-text">' + escapeHtml(full) + '</pre>' : '<p class="wb-preview-empty">（无内容）</p>') +
      '</div>' +
    '</div>' +
  '</div>';
}

// --- 主入口 ---

async function openWorldbookManager() {
  const names = sortNames(await getWorldbookNames());
  if (!names.length) { toastr.warning('当前没有任何世界书'); return; }
  const popup = new SillyTavern.Popup(
    buildManagerHTML(names),
    SillyTavern.POPUP_TYPE.TEXT,
    '',
    { large: true, wider: true, okButton: '关闭', allowVerticalScrolling: true,
      onOpen: async (pi) => { await initManagerEvents(pi.dlg); } }
  );
  await popup.show();
}

// --- 构建 HTML ---

function buildManagerHTML(names) {
  const opts = names.map(n =>
    '<option value="' + escapeHtml(n) + '">' + escapeHtml(n) + '</option>'
  ).join('');

  const bookItems = names.map(n =>
    '<div class="wb-entry-item wb-book-item" data-book="' + escapeHtml(n) + '">' +
      '<input type="checkbox" class="wb-book-check" value="' + escapeHtml(n) + '">' +
      '<div class="wb-entry-info"><span class="wb-entry-name">📕 ' + escapeHtml(n) + '</span></div>' +
    '</div>'
  ).join('');

  return STYLE +
  '<div class="wb-manager-container">' +
    '<div class="wb-header">' +
      '<h3>📚 世界书批量管理</h3>' +
      '<span class="wb-version">' + escapeHtml(VERSION) + '</span>' +
    '</div>' +

    '<div class="wb-tab-bar">' +
      '<div class="wb-tab active" data-tab="entries">📋 条目管理</div>' +
      '<div class="wb-tab" data-tab="books">📕 世界书管理</div>' +
    '</div>' +

    '<div class="wb-tab-content wb-tab-visible" data-tab-content="entries">' +
      '<div class="wb-manager-section">' +
        '<label>选择世界书</label>' +
        '<select class="wb-manager-select" id="wb-select">' +
          '<option value="">-- 请选择世界书 --</option>' +
          opts +
        '</select>' +
      '</div>' +

      '<div class="wb-toolbar" id="wb-entry-toolbar" style="display:none;">' +
        '<button id="wb-select-all">全选可见</button>' +
        '<button id="wb-deselect-all">清空选择</button>' +
        '<button id="wb-select-disabled">禁用项</button>' +
        '<button id="wb-select-constant">⚡ 常驻</button>' +
        '<span class="wb-toolbar-sep"></span>' +
        '<button id="wb-select-empty-content">📭 空内容</button>' +
        '<button id="wb-select-empty-keys">🔑 空关键词</button>' +
        '<button id="wb-select-duplicates">👥 重复内容</button>' +
        '<span class="wb-toolbar-sep"></span>' +
        '<button id="wb-invert-selection">反选可见</button>' +
        '<button id="wb-collapse-all">收起预览</button>' +
        '<input type="text" class="wb-filter-input" id="wb-filter" placeholder="搜索标题/关键词/内容…">' +
        '<span class="wb-counter" id="wb-counter"></span>' +
      '</div>' +

      '<div id="wb-entries-container"></div>' +

      '<div class="wb-op-tabs" id="wb-op-tabs" style="display:none;">' +
        '<div class="wb-op-tab active" data-op="delete">🗑️ 删除</div>' +
        '<div class="wb-op-tab" data-op="keywords">🔑 关键词</div>' +
        '<div class="wb-op-tab" data-op="group">📂 组</div>' +
        '<div class="wb-op-tab" data-op="replace">🔄 替换</div>' +
      '</div>' +

      '<div class="wb-op-panel" data-op-panel="delete">' +
        '<div class="wb-toolbar">' +
          '<button class="danger" id="wb-delete-selected">🗑️ 删除选中条目</button>' +
          '<span class="wb-selected-badge" id="wb-selected-count"></span>' +
        '</div>' +
      '</div>' +

      '<div class="wb-op-panel" data-op-panel="keywords">' +
        '<div class="wb-op-row">' +
          '<select class="wb-op-select" id="wb-key-action">' +
            '<option value="add">➕ 添加关键词</option>' +
            '<option value="remove">➖ 删除关键词</option>' +
            '<option value="replace">🔄 替换关键词</option>' +
          '</select>' +
          '<select class="wb-op-select" id="wb-key-target">' +
            '<option value="key">主关键词</option>' +
            '<option value="keysecondary">次要关键词</option>' +
          '</select>' +
        '</div>' +
        '<div class="wb-op-row" id="wb-key-add-row">' +
          '<input class="wb-op-input" id="wb-key-add-input" placeholder="输入关键词，逗号分隔，如：A, B, C">' +
        '</div>' +
        '<div class="wb-op-row" id="wb-key-remove-row" style="display:none;">' +
          '<input class="wb-op-input" id="wb-key-remove-input" placeholder="输入要删除的关键词，逗号分隔">' +
        '</div>' +
        '<div class="wb-op-row" id="wb-key-replace-row" style="display:none;">' +
          '<input class="wb-op-input" id="wb-key-find" placeholder="查找" style="flex:1;">' +
          '<span style="color:#555;">→</span>' +
          '<input class="wb-op-input" id="wb-key-replace" placeholder="替换为" style="flex:1;">' +
          '<label class="wb-checkbox-label"><input type="checkbox" id="wb-key-regex"> 正则</label>' +
        '</div>' +
        '<div class="wb-op-row">' +
          '<button class="wb-op-btn" id="wb-key-execute">▶ 执行</button>' +
          '<span class="wb-op-result" id="wb-key-result"></span>' +
        '</div>' +
        '<div class="wb-op-note">仅对当前搜索结果中已选中的条目操作。</div>' +
      '</div>' +

      '<div class="wb-op-panel" data-op-panel="group">' +
        '<div class="wb-op-row">' +
          '<span class="wb-op-label">📂 组名</span>' +
          '<input class="wb-op-input" id="wb-grp-name" placeholder="输入组名（留空清除）">' +
          '<button class="wb-op-btn" id="wb-grp-name-set">设置</button>' +
        '</div>' +
        '<div class="wb-op-row">' +
          '<span class="wb-op-label">⚖ 权重</span>' +
          '<input class="wb-op-input" id="wb-grp-weight" type="number" value="100" min="0" style="width:90px;flex:unset;">' +
          '<button class="wb-op-btn" id="wb-grp-weight-set">设置</button>' +
        '</div>' +
        '<div class="wb-op-row">' +
          '<span class="wb-op-label">🔝 覆盖</span>' +
          '<select class="wb-op-select" id="wb-grp-override">' +
            '<option value="1">开启</option>' +
            '<option value="0">关闭</option>' +
          '</select>' +
          '<button class="wb-op-btn" id="wb-grp-override-set">设置</button>' +
        '</div>' +
        '<div class="wb-op-row">' +
          '<span class="wb-op-result" id="wb-grp-result"></span>' +
        '</div>' +
        '<div class="wb-op-note">仅对当前搜索结果中已选中的条目操作。</div>' +
      '</div>' +

      '<div class="wb-op-panel" data-op-panel="replace">' +
        '<div class="wb-op-row">' +
          '<span class="wb-op-label">目标</span>' +
          '<select class="wb-op-select" id="wb-rpl-target">' +
            '<option value="content">内容</option>' +
            '<option value="key">主关键词</option>' +
            '<option value="keysecondary">次要关键词</option>' +
            '<option value="comment">标题/备注</option>' +
          '</select>' +
          '<label class="wb-checkbox-label"><input type="checkbox" id="wb-rpl-regex"> 正则</label>' +
          '<label class="wb-checkbox-label"><input type="checkbox" id="wb-rpl-case"> 区分大小写</label>' +
        '</div>' +
        '<div class="wb-op-row">' +
          '<input class="wb-op-input" id="wb-rpl-find" placeholder="查找文本">' +
          '<span style="color:#555;">→</span>' +
          '<input class="wb-op-input" id="wb-rpl-with" placeholder="替换为（留空=删除匹配）">' +
        '</div>' +
        '<div class="wb-op-row">' +
          '<button class="wb-op-btn" id="wb-rpl-preview">🔍 预览匹配</button>' +
          '<button class="wb-op-btn" id="wb-rpl-execute">▶ 执行替换</button>' +
          '<span class="wb-op-result" id="wb-rpl-result"></span>' +
        '</div>' +
        '<div class="wb-op-note">仅对当前搜索结果中已选中的条目操作。</div>' +
      '</div>' +
    '</div>' +

    '<div class="wb-tab-content" data-tab-content="books">' +
      '<label class="wb-section-label">选择要删除的世界书</label>' +
      '<div class="wb-toolbar" id="wb-books-toolbar">' +
        '<button id="wb-books-select-all">全选可见</button>' +
        '<button id="wb-books-deselect-all">清空选择</button>' +
        '<button id="wb-books-invert-selection">反选可见</button>' +
        '<input type="text" class="wb-filter-input" id="wb-books-filter" placeholder="搜索世界书名称…">' +
        '<span class="wb-counter" id="wb-books-counter"></span>' +
      '</div>' +
      '<div class="wb-manager-entries-list" id="wb-books-list">' +
        bookItems +
        '<div class="wb-no-match-msg" id="wb-books-no-match">没有匹配的世界书</div>' +
      '</div>' +
      '<div class="wb-toolbar">' +
        '<button class="danger" id="wb-delete-books">🗑️ 删除选中世界书</button>' +
        '<span class="wb-selected-badge" id="wb-books-selected-count"></span>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// --- 世界书 tab 工具 ---

function syncBookVisuals($d) {
  $d.find('.wb-book-item').each(function(){
    $(this).toggleClass('wb-selected', $(this).find('.wb-book-check').prop('checked'));
  });
}
function updateBooksCounter($d) {
  const kw = ($d.find('#wb-books-filter').val() || '').toLowerCase().trim();
  const $i = $d.find('.wb-book-item');
  const t = $i.length, v = $i.filter(':visible').length;
  $d.find('#wb-books-counter').text(
    t === 0 ? '没有世界书' : !kw ? '共 ' + t + ' 本' : v === 0 ? '没有匹配（共 ' + t + ' 本）' : '显示 ' + v + ' / ' + t + ' 本'
  );
  $d.find('#wb-books-no-match').toggle(kw !== '' && v === 0);
}
function updateBooksSelectedCount($d) {
  const c = $d.find('.wb-book-check:checked').length;
  $d.find('#wb-books-selected-count').text(c > 0 ? '已选中 ' + c + ' 本世界书' : '');
  $d.find('#wb-delete-books').toggleClass('wb-has-selection', c > 0);
  syncBookVisuals($d);
}

// --- 事件绑定 ---

async function initManagerEvents(dlg) {
  const $d = $(dlg);
  let currentEntries = [], filteredEntries = [], currentBook = '';
  let isProcessing = false, loadVersion = 0, renderedCount = 0, filterDebounce = null;
  const selectedUids = new Set();

  updateBooksCounter($d);

  const ctx = {
    get currentBook() { return currentBook; },
    async reloadEntries() { await reloadEntries(); },
    setProcessing(v) { isProcessing = v; },
  };

  function syncCB() {
    $d.find('#wb-entries-container .wb-entry-wrapper').each(function(){
      const uid = Number($(this).data('uid')), s = selectedUids.has(uid);
      $(this).find('.wb-entry-check').prop('checked', s);
      $(this).toggleClass('wb-selected', s);
    });
  }
  function updBadge() {
    const c = selectedUids.size;
    $d.find('#wb-selected-count').text(c > 0 ? '已选中 ' + c + ' 个条目' : '');
    $d.find('#wb-delete-selected').toggleClass('wb-has-selection', c > 0);
  }
  function updCounter() {
    const t = currentEntries.length, f = filteredEntries.length;
    const kw = ($d.find('#wb-filter').val() || '').trim();
    $d.find('#wb-counter').text(
      t === 0 ? '没有条目' : !kw ? '共 ' + t + ' 个条目' : f === 0 ? '没有匹配（共 ' + t + ' 个）' : '显示 ' + f + ' / ' + t + ' 个条目'
    );
  }

  function renderChunk() {
    if (renderedCount >= filteredEntries.length) return;
    const $l = $d.find('#wb-scroll-list');
    if (!$l.length) return;
    const end = Math.min(renderedCount + CHUNK_SIZE, filteredEntries.length);
    const tmp = document.createElement('div');
    let h = '';
    for (let i = renderedCount; i < end; i++) {
      h += buildSingleEntryHTML(filteredEntries[i], selectedUids.has(filteredEntries[i].uid));
    }
    tmp.innerHTML = h;
    const frag = document.createDocumentFragment();
    while (tmp.firstChild) frag.appendChild(tmp.firstChild);
    const sen = $l.find('.wb-load-sentinel')[0];
    if (sen) $l[0].insertBefore(frag, sen); else $l[0].appendChild(frag);
    renderedCount = end;
    const $s = $l.find('.wb-load-sentinel');
    if (renderedCount < filteredEntries.length)
      $s.show().text('已加载 ' + renderedCount + '/' + filteredEntries.length + '，滚动加载更多…');
    else $s.hide();
  }

  function renderAll() {
    const c = $d.find('#wb-entries-container');
    renderedCount = 0;
    if (!filteredEntries.length) {
      c.html('<div class="wb-empty-msg">' + (currentEntries.length ? '🔍 没有匹配的条目' : '📭 该世界书没有任何条目') + '</div>');
      return;
    }
    c.html('<div class="wb-manager-entries-list" id="wb-scroll-list"><div class="wb-load-sentinel">加载中…</div></div>');
    renderChunk();
    const sl = $d.find('#wb-scroll-list')[0];
    if (sl) {
      let t = false;
      sl.addEventListener('scroll', function() {
        if (t || renderedCount >= filteredEntries.length) return;
        t = true;
        requestAnimationFrame(function() {
          t = false;
          if (sl.scrollTop + sl.clientHeight >= sl.scrollHeight - 200) renderChunk();
        });
      }, { passive: true });
    }
  }

  function applyFilter(kw) {
    if (kw) {
      filteredEntries = currentEntries.filter(function(e) {
        return [e.name || '', String(e.uid), String(e.order), (e.keys || []).join(','), (e.keysSecondary || []).join(','), (e.content || '').substring(0, 500), e.group || '']
          .join(' ').toLowerCase().includes(kw.toLowerCase());
      });
    } else {
      filteredEntries = [...currentEntries];
    }
    const visibleUids = new Set(filteredEntries.map(e => e.uid));
    for (const uid of Array.from(selectedUids)) {
      if (!visibleUids.has(uid)) selectedUids.delete(uid);
    }
    renderAll(); updCounter(); updBadge();
  }

  function getTargetEntries() {
    if (!selectedUids.size) return [];
    const set = new Set(selectedUids);
    return filteredEntries.filter(e => set.has(e.uid));
  }

  async function reloadEntries() {
    if (!currentBook) return;
    try {
      const raw = await getWorldbook(currentBook);
      const list = asArray(raw);
      currentEntries = list.map(normalizeEntry);
      const kw = ($d.find('#wb-filter').val() || '').trim();
      applyFilter(kw);
      syncCB(); updBadge();
    } catch(e) {
      console.error('重新加载失败:', e);
      toastr.error('加载失败: ' + e.message);
    }
  }

  // Tab 切换
  $d.on('click', '.wb-tab', function(){
    var t = $(this).data('tab');
    $d.find('.wb-tab').removeClass('active');
    $(this).addClass('active');
    $d.find('.wb-tab-content').removeClass('wb-tab-visible');
    $d.find('.wb-tab-content[data-tab-content="' + t + '"]').addClass('wb-tab-visible');
  });

  $d.on('click', '.wb-op-tab', function(e){
    e.stopPropagation();
    $d.find('.wb-op-tab').removeClass('active');
    $(this).addClass('active');
    $d.find('.wb-op-panel').removeClass('wb-op-visible');
    $d.find('.wb-op-panel[data-op-panel="' + $(this).data('op') + '"]').addClass('wb-op-visible');
  });

  // 选择世界书
  $d.on('change', '#wb-select', async function(){
    currentBook = $(this).val();
    var thisLoad = ++loadVersion;
    $d.find('#wb-filter').val('');
    selectedUids.clear();
    var c = $d.find('#wb-entries-container'), tb = $d.find('#wb-entry-toolbar'), ot = $d.find('#wb-op-tabs');
    $d.find('.wb-op-panel').removeClass('wb-op-visible');
    $d.find('.wb-op-tab').removeClass('active').first().addClass('active');

    if (!currentBook) { c.empty(); tb.hide(); ot.hide(); updCounter(); updBadge(); return; }
    c.html('<div class="wb-empty-msg wb-loading">⏳ 正在加载条目…</div>');
    tb.hide(); ot.hide();
    try {
      var raw = await getWorldbook(currentBook);
      if (thisLoad !== loadVersion) return;
      var list = asArray(raw);
      currentEntries = list.map(normalizeEntry);
      filteredEntries = [...currentEntries];
      renderAll(); tb.show(); ot.show();
      $d.find('.wb-op-panel[data-op-panel="delete"]').addClass('wb-op-visible');
      updCounter(); updBadge();
    } catch(e) {
      if (thisLoad !== loadVersion) return;
      c.html('<div class="wb-empty-msg" style="color:#e57373;">❌ 加载失败: ' + escapeHtml(e.message) + '</div>');
    }
  });

  // 预览
  $d.on('click', '.wb-preview-btn', function(e){
    e.stopPropagation();
    var $b = $(this), $p = $b.closest('.wb-entry-wrapper').find('.wb-preview-panel');
    if ($p.is(':visible')) { $p.slideUp(200); $b.removeClass('active'); }
    else { $p.slideDown(200); $b.addClass('active'); }
  });
  $d.on('click', '#wb-collapse-all', function(){
    $d.find('#wb-entries-container .wb-preview-panel:visible').slideUp(200);
    $d.find('#wb-entries-container .wb-preview-btn.active').removeClass('active');
  });

  // 条目点击/选中
  $d.on('click', '#wb-entries-container .wb-entry-item', function(e){
    if ($(e.target).is('input[type="checkbox"]') || $(e.target).closest('.wb-preview-btn').length) return;
    var $w = $(this).closest('.wb-entry-wrapper'), uid = Number($w.data('uid'));
    if (selectedUids.has(uid)) selectedUids.delete(uid); else selectedUids.add(uid);
    var s = selectedUids.has(uid);
    $w.find('.wb-entry-check').prop('checked', s);
    $w.toggleClass('wb-selected', s); updBadge();
  });
  $d.on('change', '.wb-entry-check', function(){
    var uid = Number($(this).data('uid'));
    if ($(this).prop('checked')) selectedUids.add(uid); else selectedUids.delete(uid);
    $(this).closest('.wb-entry-wrapper').toggleClass('wb-selected', $(this).prop('checked'));
    updBadge();
  });

  // 批选按钮
  $d.on('click', '#wb-select-all', function(){ filteredEntries.forEach(function(e){ selectedUids.add(e.uid); }); syncCB(); updBadge(); });
  $d.on('click', '#wb-deselect-all', function(){ selectedUids.clear(); syncCB(); updBadge(); });
  $d.on('click', '#wb-select-disabled', function(){
    selectedUids.clear();
    filteredEntries.filter(function(e){ return !e.enabled; }).forEach(function(e){ selectedUids.add(e.uid); });
    syncCB(); updBadge();
  });
  $d.on('click', '#wb-select-constant', function(){
    selectedUids.clear();
    filteredEntries.filter(function(e){ return e.constant; }).forEach(function(e){ selectedUids.add(e.uid); });
    syncCB(); updBadge();
  });
  $d.on('click', '#wb-invert-selection', function(){
    filteredEntries.forEach(function(e){
      if (selectedUids.has(e.uid)) selectedUids.delete(e.uid); else selectedUids.add(e.uid);
    }); syncCB(); updBadge();
  });
  $d.on('click', '#wb-select-empty-content', function(){
    selectedUids.clear();
    var r = filteredEntries.filter(function(e){ return !(e.content || '').trim(); });
    r.forEach(function(e){ selectedUids.add(e.uid); }); syncCB(); updBadge();
    toastr.info(r.length ? '找到 ' + r.length + ' 个空内容条目' : '没有找到空内容条目');
  });
  $d.on('click', '#wb-select-empty-keys', function(){
    selectedUids.clear();
    var r = filteredEntries.filter(function(e){ return !e.keys || e.keys.filter(Boolean).length === 0; });
    r.forEach(function(e){ selectedUids.add(e.uid); }); syncCB(); updBadge();
    toastr.info(r.length ? '找到 ' + r.length + ' 个空关键词条目' : '没有找到空关键词条目');
  });
  $d.on('click', '#wb-select-duplicates', function(){
    selectedUids.clear();
    var m = new Map();
    filteredEntries.forEach(function(e){
      var c = (e.content || '').trim();
      if (!c) return;
      if (!m.has(c)) m.set(c, []);
      m.get(c).push(e.uid);
    });
    var dc = 0, gc = 0;
    for (var [,u] of m) if (u.length > 1) { gc++; u.forEach(function(uid){ selectedUids.add(uid); dc++; }); }
    syncCB(); updBadge();
    toastr.info(dc ? '找到 ' + dc + ' 个内容完全相同的条目（' + gc + ' 组）' : '没有找到重复内容条目');
  });

  // 搜索
  $d.on('input', '#wb-filter', function(){
    clearTimeout(filterDebounce);
    var v = $(this).val();
    filterDebounce = setTimeout(function(){ applyFilter(v.trim()); }, 200);
  });

  // 删除条目（导出 ST worldbook JSON）
  $d.on('click', '#wb-delete-selected', async function(){
    if (isProcessing) return;
    if (!selectedUids.size) { toastr.warning('没有选中任何条目'); return; }
    var count = selectedUids.size;
    var book = currentBook;

    var res = await confirmDeleteWithBackup('⚠️ 删除 ' + count + ' 个条目', count, async function() {
      var entries = asArray(await TavernHelper.getWorldbook(book));
      var backup = entries.filter(e => selectedUids.has(e.uid));
      var stFile = worldbookEntriesToStImportableFile(backup);
      var ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
      return { data: stFile, name: 'backup_entries_' + sanitizeFilename(book) + '_' + ts + '.json' };
    });

    if (res === 'cancel') return;

    isProcessing = true;
    var $b = $(this); $b.prop('disabled', true).text('⏳ 删除中…');
    try {
      var result = await deleteWorldbookEntriesAPI(book, function(e){ return selectedUids.has(e.uid); });
      toastr.success('成功删除 ' + (result.deleted_entries || []).length + ' 个条目');
      selectedUids.clear();
      await reloadEntries();
    } catch(e) {
      toastr.error('删除失败: ' + e.message);
    }
    finally {
      isProcessing = false;
      $b.prop('disabled', false).text('🗑️ 删除选中条目');
    }
  });

  // 关键词面板切换
  $d.on('change', '#wb-key-action', function(){
    var a = $(this).val();
    $d.find('#wb-key-add-row,#wb-key-remove-row,#wb-key-replace-row').hide();
    $d.find('#wb-key-' + a + '-row').show();
    $d.find('#wb-key-result').text('');
  });

  // 关键词批量操作
  $d.on('click', '#wb-key-execute', async function(){
    if (isProcessing) return;
    var action = $d.find('#wb-key-action').val();
    var field = $d.find('#wb-key-target').val();
    var entries = getTargetEntries();
    if (!entries.length) { toastr.warning('请先选中至少一个可见条目'); return; }
    var $b = $(this), $r = $d.find('#wb-key-result');
    $r.text('');

    if (action === 'add') {
      var raw = $d.find('#wb-key-add-input').val();
      if (!raw || !raw.trim()) { toastr.warning('请输入要添加的关键词'); return; }
      var toAdd = raw.split(',').map(s => s.trim()).filter(Boolean);
      if (!toAdd.length) { toastr.warning('请输入有效关键词'); return; }

      await batchOp(ctx, $b, '▶ 执行', entries, function(entry){
        ensureEntryShape(entry);
        var targetArray = getRawKeywordArray(entry, field);
        var existed = new Set(targetArray.map(k => getKeywordText(k).trim()));
        var appended = [...targetArray];
        toAdd.forEach(function(k){
          if (!existed.has(k)) {
            existed.add(k);
            appended.push(k);
          }
        });
        setRawKeywordArray(entry, field, dedupeKeywordValues(appended));
      }, '关键词添加');

      $d.find('#wb-key-add-input').val('');
      $r.text('✅ 添加完成');
    } else if (action === 'remove') {
      var raw2 = $d.find('#wb-key-remove-input').val();
      if (!raw2 || !raw2.trim()) { toastr.warning('请输入要删除的关键词'); return; }
      var toRm = new Set(raw2.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));

      await batchOp(ctx, $b, '▶ 执行', entries, function(entry){
        ensureEntryShape(entry);
        var targetArray = getRawKeywordArray(entry, field);
        var newKeys = targetArray.filter(function(k){
          return !toRm.has(getKeywordText(k).toLowerCase().trim());
        });
        setRawKeywordArray(entry, field, dedupeKeywordValues(newKeys));
      }, '关键词删除');

      $d.find('#wb-key-remove-input').val('');
      $r.text('✅ 删除完成');
    } else if (action === 'replace') {
      var findStr = $d.find('#wb-key-find').val();
      var replStr = $d.find('#wb-key-replace').val() || '';
      var useReg = $d.find('#wb-key-regex').prop('checked');
      if (!findStr) { toastr.warning('请输入查找内容'); return; }
      if (useReg) {
        try { new RegExp(findStr); }
        catch (e) { toastr.error('正则表达式语法错误: ' + e.message); return; }
      }

      await batchOp(ctx, $b, '▶ 执行', entries, function(entry){
        ensureEntryShape(entry);
        var targetArray = getRawKeywordArray(entry, field);
        var changed = false;
        var newKeys = targetArray.map(function(k){
          var keyStr = getKeywordText(k);
          var n;
          if (useReg) {
            try { n = keyStr.replace(new RegExp(findStr, 'g'), replStr); }
            catch (er) { n = keyStr; }
          } else {
            n = keyStr.split(findStr).join(replStr);
          }
          if (n !== keyStr) changed = true;
          return rebuildKeywordValue(k, n.trim());
        }).filter(function(k){ return !!getKeywordText(k).trim(); });

        if (changed) {
          setRawKeywordArray(entry, field, dedupeKeywordValues(newKeys));
        }
      }, '关键词替换');

      $r.text('✅ 替换完成');
    }
  });

  // 组操作
  $d.on('click', '#wb-grp-name-set', async function(){
    if (isProcessing) return;
    var val = $d.find('#wb-grp-name').val() || '';
    var entries = getTargetEntries();
    if (!entries.length) { toastr.warning('请先选中至少一个可见条目'); return; }
    var $r = $d.find('#wb-grp-result');

    await batchOp(ctx, $(this), '设置', entries, function(entry){
      ensureEntryShape(entry);
      entry.extra.group = val;
    }, '组名设置');

    $r.text('✅ 组名设置完成');
  });

  $d.on('click', '#wb-grp-weight-set', async function(){
    if (isProcessing) return;
    var val = parseInt($d.find('#wb-grp-weight').val()) || 0;
    var entries = getTargetEntries();
    if (!entries.length) { toastr.warning('请先选中至少一个可见条目'); return; }
    var $r = $d.find('#wb-grp-result');

    await batchOp(ctx, $(this), '设置', entries, function(entry){
      ensureEntryShape(entry);
      entry.extra.group_weight = val;
    }, '组权重设置');

    $r.text('✅ 权重设置完成');
  });

  $d.on('click', '#wb-grp-override-set', async function(){
    if (isProcessing) return;
    var val = $d.find('#wb-grp-override').val();
    var entries = getTargetEntries();
    if (!entries.length) { toastr.warning('请先选中至少一个可见条目'); return; }
    var $r = $d.find('#wb-grp-result');

    await batchOp(ctx, $(this), '设置', entries, function(entry){
      ensureEntryShape(entry);
      entry.extra.group_override = (val === '1' || val === true || val === 'true');
    }, '组覆盖设置');

    $r.text('✅ 覆盖设置完成');
  });

  // 替换操作
  function buildReplaceRegex() {
    var findStr = $d.find('#wb-rpl-find').val();
    var useReg = $d.find('#wb-rpl-regex').prop('checked');
    var caseSen = $d.find('#wb-rpl-case').prop('checked');
    if (!findStr) return null;
    var flags = caseSen ? 'g' : 'gi';
    var pattern = useReg ? findStr : escapeRegExp(findStr);
    return new RegExp(pattern, flags);
  }
  var fieldNames = { content:'内容', key:'主关键词', keysecondary:'次要关键词', comment:'标题/备注' };

  $d.on('click', '#wb-rpl-preview', function(){
    var $r = $d.find('#wb-rpl-result');
    var findStr = $d.find('#wb-rpl-find').val();
    if (!findStr) { $r.text('请输入查找内容'); return; }
    var regex;
    try { regex = buildReplaceRegex(); } catch(e) { $r.text('正则语法错误: ' + e.message); return; }
    if (!regex) { $r.text('请输入查找内容'); return; }

    var field = $d.find('#wb-rpl-target').val();
    var entries = getTargetEntries();
    if (!entries.length) { toastr.warning('请先选中至少一个可见条目'); return; }
    var matchCount = 0;
    entries.forEach(function(e){
      var val = getFieldValue(e, field);
      regex.lastIndex = 0;
      if (regex.test(val)) matchCount++;
      regex.lastIndex = 0;
    });
    $r.text('🔍 在 ' + entries.length + ' 个选中条目中，有 ' + matchCount + ' 个条目包含匹配');
    if (!matchCount) toastr.info('没有找到匹配');
  });

  $d.on('click', '#wb-rpl-execute', async function(){
    if (isProcessing) return;
    var findStr = $d.find('#wb-rpl-find').val();
    var replStr = $d.find('#wb-rpl-with').val() || '';
    if (!findStr) { toastr.warning('请输入查找内容'); return; }
    var regex;
    try { regex = buildReplaceRegex(); } catch(e) { toastr.error('正则语法错误: ' + e.message); return; }
    if (!regex) { toastr.warning('请输入查找内容'); return; }

    var field = $d.find('#wb-rpl-target').val();
    var entries = getTargetEntries();
    if (!entries.length) { toastr.warning('请先选中至少一个可见条目'); return; }
    var $r = $d.find('#wb-rpl-result');

    var affected = [];
    entries.forEach(function(e){
      var val = getFieldValue(e, field);
      regex.lastIndex = 0;
      if (regex.test(val)) affected.push(e);
      regex.lastIndex = 0;
    });

    if (!affected.length) { toastr.info('没有找到匹配的条目'); $r.text('没有匹配'); return; }

    var confirmHtml = '<div style="text-align:center;">' +
      '<h3 style="color:#ffb74d;">确认批量替换</h3>' +
      '<p style="color:var(--SmartThemeBodyColor,#ddd);">' +
        '将在 <b style="color:#64b5f6;">' + affected.length + '</b> 个选中条目的' +
        ' <b style="color:#81c784;">' + (fieldNames[field] || field) + '</b> 中执行替换' +
      '</p>' +
      '<p style="color:#aaa;font-size:12px;">' +
        '「' + escapeHtml(findStr) + '」→「' + escapeHtml(replStr || '(删除)') + '」' +
      '</p>' +
      '<p style="color:#ef9a9a;font-size:12px;">此操作不可撤销</p>' +
    '</div>';
    var confirmResult = await SillyTavern.callGenericPopup(confirmHtml, SillyTavern.POPUP_TYPE.CONFIRM, '', {
      okButton: '确认替换',
      cancelButton: '取消',
    });
    if (confirmResult !== SillyTavern.POPUP_RESULT.AFFIRMATIVE) return;

    await batchOp(ctx, $(this), '▶ 执行替换', affected, function(entry){
      ensureEntryShape(entry);

      if (field === 'key' || field === 'keysecondary') {
        var targetArray = getRawKeywordArray(entry, field);
        var changed = false;
        var newKeys = targetArray.map(function(k){
          var oldText = getKeywordText(k);
          regex.lastIndex = 0;
          var newText = oldText.replace(regex, replStr);
          if (newText !== oldText) changed = true;
          return rebuildKeywordValue(k, newText.trim());
        }).filter(function(k){ return !!getKeywordText(k).trim(); });

        if (changed) {
          setRawKeywordArray(entry, field, dedupeKeywordValues(newKeys));
        }
        return;
      }

      var val = getFieldValue(entry, field);
      regex.lastIndex = 0;
      var newVal = val.replace(regex, replStr);
      if (newVal !== val) {
        switch(field) {
          case 'content': entry.content = newVal; break;
          case 'comment': entry.name = newVal; break;
        }
      }
    }, '文本替换');

    $r.text('✅ 替换完成');
  });

  // 世界书列表过滤/选择/删除
  $d.on('input', '#wb-books-filter', function(){
    var kw = $(this).val().toLowerCase().trim();
    $d.find('.wb-book-item').each(function(){
      $(this).toggle(kw === '' || $(this).find('.wb-entry-name').text().toLowerCase().includes(kw));
    });
    updateBooksCounter($d);
  });
  $d.on('click', '#wb-books-select-all', function(){
    $d.find('.wb-book-item:visible .wb-book-check').prop('checked', true);
    updateBooksSelectedCount($d);
  });
  $d.on('click', '#wb-books-deselect-all', function(){
    $d.find('.wb-book-check').prop('checked', false);
    updateBooksSelectedCount($d);
  });
  $d.on('click', '#wb-books-invert-selection', function(){
    $d.find('.wb-book-item:visible .wb-book-check').each(function(){
      $(this).prop('checked', !$(this).prop('checked'));
    });
    updateBooksSelectedCount($d);
  });
  $d.on('change', '.wb-book-check', function(){
    updateBooksSelectedCount($d);
  });
  $d.on('click', '.wb-book-item', function(e){
    if ($(e.target).is('input[type="checkbox"]')) return;
    var cb = $(this).find('.wb-book-check');
    cb.prop('checked', !cb.prop('checked'));
    updateBooksSelectedCount($d);
  });

  // 删除世界书（备份为 ST worldbook JSON 或 ZIP）
  $d.on('click', '#wb-delete-books', async function(){
    if (isProcessing) return;
    var checked = [];
    $d.find('.wb-book-check:checked').each(function(){ checked.push($(this).val()); });
    if (!checked.length) { toastr.warning('没有选中任何世界书'); return; }

    const bindingsInfo = await getWorldbookBindingsInfo(checked);
    var assocHtml = buildAssociationHTML(checked, bindingsInfo);

    var res = await confirmDeleteWithBackup('⚠️ 删除 ' + checked.length + ' 本世界书', checked.length, async function(){
      var ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);

      if (checked.length === 1) {
        var entries = asArray(await TavernHelper.getWorldbook(checked[0]));
        var stFile = worldbookEntriesToStImportableFile(entries);
        return { data: stFile, name: 'backup_' + sanitizeFilename(checked[0]) + '_' + ts + '.json' };
      } else {
        var JSZip = await loadJSZip();
        var zip = new JSZip();
        for (var i = 0; i < checked.length; i++) {
          var n = checked[i];
          var entries2 = asArray(await TavernHelper.getWorldbook(n));
          var stFile2 = worldbookEntriesToStImportableFile(entries2);
          zip.file(sanitizeFilename(n) + '.json', JSON.stringify(stFile2, null, 2));
        }
        var zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        return { blob: zipBlob, name: 'backup_worldbooks_' + ts + '.zip' };
      }
    }, assocHtml);

    if (res === 'cancel') return;

    isProcessing = true;
    var $b = $(this); $b.prop('disabled', true).text('⏳ 删除中…');
    var ok = 0, fail = 0;
    for (var i = 0; i < checked.length; i++) {
      var bn = checked[i];
      try {
        $b.text('⏳ 删除中… ' + (i + 1) + ' / ' + checked.length);
        if (await deleteWorldbook(bn)) {
          ok++;
          $d.find('.wb-book-item').filter(function(){ return $(this).data('book') === bn; }).fadeOut(300, function(){ $(this).remove(); });
          $d.find('#wb-select option').filter(function(){ return $(this).val() === bn; }).remove();
          if (currentBook === bn) {
            currentBook = '';
            currentEntries = [];
            filteredEntries = [];
            selectedUids.clear();
            $d.find('#wb-select').val('');
            $d.find('#wb-entries-container').empty();
            $d.find('#wb-entry-toolbar,#wb-op-tabs').hide();
            $d.find('.wb-op-panel').removeClass('wb-op-visible');
            updCounter(); updBadge();
          }
        } else {
          fail++;
        }
      } catch(e) {
        fail++;
        console.error('删除 "' + bn + '" 失败:', e);
      }
    }
    if (ok) toastr.success('成功删除 ' + ok + ' 本世界书');
    if (fail) toastr.error(fail + ' 本删除失败');
    isProcessing = false;
    $b.prop('disabled', false).text('🗑️ 删除选中世界书');
    $d.find('#wb-books-filter').val('');
    setTimeout(function(){
      $d.find('.wb-book-item').show();
      updateBooksCounter($d);
      updateBooksSelectedCount($d);
    }, 350);
  });
}

// --- 魔法棒入口 ---

const WB_BUTTON_ID = 'wb-batch-manager-btn-magic';

function initWBMagicMenu() {
  try {
    const doc = (window.parent && window.parent.document) ? window.parent.document : document;

    $(`#wb-batch-manager-btn, #${WB_BUTTON_ID}`, doc).remove();

    const btnHtml = `
      <div id="${WB_BUTTON_ID}" class="list-group-item flex-container flexGap5 interactable" 
           title="打开世界书批量管理工具" tabIndex="0" style="cursor: pointer;">
        <i class="fa-solid fa-book"></i>
        <span>世界书批量管理</span>
      </div>
    `;

    const extensionsMenu = $('#extensionsMenu', doc);
    if (extensionsMenu.length === 0) {
      console.error('[WB Manager] 未找到魔法棒菜单');
      return;
    }

    if ($(`#${WB_BUTTON_ID}`, doc).length === 0) {
      extensionsMenu.append(btnHtml);

      $(doc).off('click.wbmanager').on('click.wbmanager', `#${WB_BUTTON_ID}`, async function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          await openWorldbookManager();
        } catch (err) {
          console.error('[WB Manager] 错误:', err);
          toastr.error('打开失败: ' + err.message);
        }
      });

      console.log('[WB Manager] 魔法棒入口已创建 (TavernHelper API)');
    }
  } catch (e) {
    console.error('[WB Manager] 初始化失败:', e);
  }
}

eventOn(tavern_events.APP_READY, () => { initWBMagicMenu(); });
setTimeout(initWBMagicMenu, 1000);

toastr.info('世界书批量管理工具加载成功，感谢您的使用', '✅ 就绪', { timeOut: 2500 });
