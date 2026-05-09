import { 
  Sun, Map, Train, Coffee, ListPlus, 
  LucideIcon 
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  desc: string;
  iconName: string;
  color: string;
  textColor: string;
  iconBg: string;
  activeBg: string; // Added explicit background class for active states
  order: number;
  isCustom?: boolean;
}

export interface Task {
  id: string;
  text: string;
  categoryId: string;
  subCategoryId: string;
  isCompleted: boolean;
  createdAt: number;
}

export interface SubCategory {
  id: string;
  name: string;
}

export const ICON_MAP: Record<string, LucideIcon> = { 
  Sun, 
  Map, 
  Train, 
  Coffee, 
  ListPlus 
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'oneday', name: '一日出行清单', desc: '周边游、逛街', iconName: 'Sun', color: 'bg-blue-50', textColor: 'text-blue-600', iconBg: 'bg-blue-100', activeBg: 'bg-blue-600', order: 1 },
  { id: 'multiday', name: '多日出行清单', desc: '长途旅行、出差', iconName: 'Map', color: 'bg-emerald-50', textColor: 'text-emerald-600', iconBg: 'bg-emerald-100', activeBg: 'bg-emerald-600', order: 2 },
  { id: 'hometown', name: '回老家清单', desc: '带给家人的礼物', iconName: 'Train', color: 'bg-orange-50', textColor: 'text-orange-600', iconBg: 'bg-orange-100', activeBg: 'bg-orange-600', order: 3 },
  { id: 'stayhome', name: '宅家清单', desc: '大扫除、追剧', iconName: 'Coffee', color: 'bg-purple-50', textColor: 'text-purple-600', iconBg: 'bg-purple-100', activeBg: 'bg-purple-600', order: 4 }
];

export const CUSTOM_COLORS = [
  { color: 'bg-rose-50', textColor: 'text-rose-600', iconBg: 'bg-rose-100', activeBg: 'bg-rose-600' },
  { color: 'bg-teal-50', textColor: 'text-teal-600', iconBg: 'bg-teal-100', activeBg: 'bg-teal-600' },
  { color: 'bg-indigo-50', textColor: 'text-indigo-600', iconBg: 'bg-indigo-100', activeBg: 'bg-indigo-600' },
  { color: 'bg-amber-50', textColor: 'text-amber-600', iconBg: 'bg-amber-100', activeBg: 'bg-amber-600' },
  { color: 'bg-pink-50', textColor: 'text-pink-600', iconBg: 'bg-pink-100', activeBg: 'bg-pink-600' }
];

export const SUB_CATEGORIES: SubCategory[] = [
  { id: 'baby', name: '宝宝' },
  { id: 'mom', name: '妈妈' },
  { id: 'dad', name: '爸爸' },
  { id: 'mil', name: '婆婆' },
  { id: 'general', name: '通用' }
];
