import { defineEventHandler, getQuery } from 'h3';

import { verifyAccessToken } from '~/utils/jwt';
import {
  sleep,
  unAuthorizedResponse,
  usePageResponseSuccess,
} from '~/utils/response';

/**
 * GET /api/table/list
 * 演示表格接口：vxe-table 远程数据源示例
 * 数据为内存生成的演示数据（与官方 mock 字段契约一致），支持分页 + 单字段排序
 */

const PRODUCTS = ['无线耳机', '机械键盘', '4K 显示器', '人体工学椅', 'USB-C 扩展坞', '降噪麦克风', '电动升降桌', '便携显示器'];
const CATEGORIES = ['外设', '显示', '办公', '音频'];
const CURRENCIES = ['CNY', 'USD', 'EUR', 'JPY'];
const COLORS = ['black', 'white', 'silver', 'blue', 'red'];
const ADJECTIVES = ['轻量化', '旗舰级', '高性价比', '静音', '无线', '人体工学'];

function randomOf<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)] as T;
}

/** 生成 100 条演示数据（服务启动时生成一次） */
function generateDemoList(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    available: Math.random() > 0.5,
    category: randomOf(CATEGORIES),
    color: randomOf(COLORS),
    currency: randomOf(CURRENCIES),
    description: `${randomOf(ADJECTIVES)}${randomOf(PRODUCTS)}，办公场景优选。`,
    id: `demo-${String(i + 1).padStart(3, '0')}`,
    imageUrl: `https://i.pravatar.cc/100?img=${(i % 70) + 1}`,
    imageUrl2: `https://i.pravatar.cc/100?img=${((i + 35) % 70) + 1}`,
    inProduction: Math.random() > 0.3,
    open: Math.random() > 0.5,
    price: (Math.random() * 2000 + 50).toFixed(2),
    productName: `${randomOf(ADJECTIVES)} ${randomOf(PRODUCTS)}`,
    quantity: Math.floor(Math.random() * 100) + 1,
    rating: Number((Math.random() * 4 + 1).toFixed(1)),
    releaseDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365),
    status: randomOf(['success', 'error', 'warning']),
    tags: Array.from({ length: 3 }, () => randomOf(ADJECTIVES)),
    weight: Number((Math.random() * 9.9 + 0.1).toFixed(1)),
  }));
}

const demoData = generateDemoList(100);

/** 数值优先、字符串兜底的通用比较（与官方 mock 排序行为对齐） */
function compareBy(a: any, b: any) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  const aNum = Number(a);
  const bNum = Number(b);
  if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  // 保留与官方 mock 相同的加载延迟，便于前端展示 loading 态
  await sleep(600);

  const { page, pageSize, sortBy, sortOrder } = getQuery(event);
  const pageNumber = Math.max(1, Number.parseInt(String(page ?? '1'), 10) || 1);
  const pageSizeNumber = Math.min(
    100,
    Math.max(1, Number.parseInt(String(pageSize ?? '10'), 10) || 10),
  );

  const sortKey = Array.isArray(sortBy) ? sortBy[0] : sortBy;
  const sortOrderRaw = Array.isArray(sortOrder) ? sortOrder[0] : sortOrder;
  const listData = [...demoData];
  if (
    typeof sortKey === 'string' &&
    Object.prototype.hasOwnProperty.call(listData[0] ?? {}, sortKey)
  ) {
    const key = sortKey as keyof (typeof listData)[0];
    const isDesc = sortOrderRaw === 'desc';
    listData.sort((a, b) => (isDesc ? -compareBy(a[key], b[key]) : compareBy(a[key], b[key])));
  }

  return usePageResponseSuccess(String(pageNumber), String(pageSizeNumber), listData);
});
