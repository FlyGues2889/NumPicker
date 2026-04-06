const STORAGE_KEY = 'randomPickerConfig';

export const defaultConfig = {
  mode: 'range',
  range: { min: 1, max: 55 },
  specifiedNumbers: '',
  exclusions: [],
  tags: []
};

// 保存到 localStorage
export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// 从 localStorage 加载
export function loadConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved? JSON.parse(saved) : {...defaultConfig };
}

// 导出配置文件
export function exportConfig(config) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'random-picker-config.json';
  a.click();
  URL.revokeObjectURL(url);
}

// 导入配置文件
export function importConfig(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        resolve(config);
      } catch (err) {
        reject(new Error('无效的配置文件'));
      }
    };
    reader.readAsText(file);
  });
}