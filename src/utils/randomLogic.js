// 生成数字池
export function generateNumberPool(config) {
  let pool = [];
  
  if (config.mode === 'range') {
    const { min, max } = config.range;
    for (let i = min; i <= max; i++) {
      pool.push(i);
    }
  } else if (config.mode === 'specified') {
    pool = config.specifiedNumbers
     .split(/[,\s]+/)
     .map(Number)
     .filter(n =>!isNaN(n));
  }
  
  const exclusionSet = new Set(config.exclusions);
  pool = pool.filter(num =>!exclusionSet.has(num));
  
  return [...new Set(pool)];
}

// 单次随机抽取
export function drawRandomNumber(pool) {
  if (pool.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// 批量随机抽取（新增）
export function drawBatchNumbers(pool, count, allowRepeat = false) {
  if (pool.length === 0 || count <= 0) return [];
  
  const results = [];
  
  if (allowRepeat) {
    // 允许重复：直接抽 count 次
    for (let i = 0; i < count; i++) {
      results.push(drawRandomNumber(pool));
    }
  } else {
    // 不允许重复：使用洗牌算法抽取
    if (count > pool.length) {
      count = pool.length; // 最多只能抽完池子
    }
    
    const tempPool = [...pool]; // 复制一份避免修改原数组
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * tempPool.length);
      results.push(tempPool.splice(randomIndex, 1)[0]);
    }
  }
  
  return results;
}