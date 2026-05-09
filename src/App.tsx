/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, Plus, Trash2, CheckCircle2, 
  Circle, ListTodo, RotateCcw, Edit2, FolderPlus,
  ListPlus, GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Category, Task, INITIAL_CATEGORIES, 
  CUSTOM_COLORS, SUB_CATEGORIES, ICON_MAP 
} from './constants';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('baby');
  const [inputText, setInputText] = useState('');
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [appTitle, setAppTitle] = useState('我的备忘录');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Load data from localStorage
  useEffect(() => {
    try {
      const localCats = localStorage.getItem('h5_memo_categories');
      const localTasks = localStorage.getItem('h5_memo_tasks');
      const localTitle = localStorage.getItem('h5_memo_title');

      if (localCats) {
        setCategories(JSON.parse(localCats));
      } else {
        setCategories(INITIAL_CATEGORIES);
      }

      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      }
      
      if (localTitle) {
        setAppTitle(localTitle);
      }
    } catch (e) {
      console.error('Failed to load data', e);
      setCategories(INITIAL_CATEGORIES);
    }
    setIsReady(true);
  }, []);

  const syncData = (key: 'title' | 'cats' | 'tasks', data: any) => {
    if (key === 'title') {
      setAppTitle(data);
      localStorage.setItem('h5_memo_title', data);
    } else if (key === 'cats') {
      setCategories(data);
      localStorage.setItem('h5_memo_categories', JSON.stringify(data));
    } else if (key === 'tasks') {
      setTasks(data);
      localStorage.setItem('h5_memo_tasks', JSON.stringify(data));
    }
  };

  const currentCategory = useMemo(() => 
    categories.find(c => c.id === activeTab), 
    [categories, activeTab]
  );

  const categoryTasks = useMemo(() => 
    tasks.filter(task => task.categoryId === activeTab),
    [tasks, activeTab]
  );

  const completedTasksCount = useMemo(() => 
    categoryTasks.filter(t => t.isCompleted).length,
    [categoryTasks]
  );

  const getCategoryStats = (categoryId: string) => {
    const catTasks = tasks.filter(t => t.categoryId === categoryId);
    return { 
      total: catTasks.length, 
      completed: catTasks.filter(t => t.isCompleted).length 
    };
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newTask: Task = { 
      id: Date.now().toString(), 
      text: inputText.trim(), 
      categoryId: activeTab, 
      subCategoryId: activeSubTab, 
      isCompleted: false, 
      createdAt: Date.now() 
    };
    syncData('tasks', [...tasks, newTask]);
    setInputText('');
  };

  const toggleTask = (taskId: string) => {
    syncData('tasks', tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (taskId: string) => {
    syncData('tasks', tasks.filter(t => t.id !== taskId));
  };

  const resetCategoryTasks = () => {
    syncData('tasks', tasks.map(t => (t.categoryId === activeTab && t.isCompleted) ? { ...t, isCompleted: false } : t));
  };

  const handleReorderTasks = (newSubTasks: Task[], subId: string) => {
    // Map tasks to include the correctly resolved subCategoryId for comparison
    const nextTasks = [...tasks];
    const targetIndices: number[] = [];
    
    tasks.forEach((task, index) => {
      const taskSubId = task.subCategoryId || 'general';
      if (task.categoryId === activeTab && taskSubId === subId) {
        targetIndices.push(index);
      }
    });

    if (targetIndices.length !== newSubTasks.length) return;

    targetIndices.forEach((originalIndex, i) => {
      nextTasks[originalIndex] = newSubTasks[i];
    });

    syncData('tasks', nextTasks);
  };

  const handleReorderCategories = (newOrder: Category[]) => {
    syncData('cats', newOrder);
  };

  const handleAddCategory = () => {
    const customCount = categories.filter(c => c.isCustom).length;
    const colorSet = CUSTOM_COLORS[customCount % CUSTOM_COLORS.length];
    const newCat: Category = { 
      id: `custom_${Date.now()}`, 
      name: '新建清单', 
      desc: '自由记录你的专属备忘', 
      iconName: 'ListPlus', 
      ...colorSet, 
      isCustom: true, 
      order: Date.now() 
    };
    syncData('cats', [...categories, newCat]);
    setEditingCategoryId(newCat.id);
    setEditName(newCat.name);
  };

  const saveCategoryName = (id: string) => {
    if (editName.trim()) {
      syncData('cats', categories.map(c => c.id === id ? { ...c, name: editName.trim() } : c));
    }
    setEditingCategoryId(null);
  };

  const deleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    syncData('cats', categories.filter(c => c.id !== id));
    syncData('tasks', tasks.filter(t => t.categoryId !== id));
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 md:p-8">
      <div id="phone-container" className="w-full h-screen sm:h-[844px] sm:max-w-[390px] bg-white sm:rounded-[40px] sm:shadow-2xl overflow-hidden relative flex flex-col ring-1 ring-gray-900/5">
        
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col bg-gray-50 overflow-y-auto no-scrollbar"
            >
              {/* Header */}
              <div className="px-6 pt-16 pb-8 bg-white rounded-b-[32px] shadow-sm mb-6">
                <div className="flex items-center gap-3">
                  {isEditingTitle ? (
                    <input 
                      autoFocus 
                      value={tempTitle} 
                      onChange={e => setTempTitle(e.target.value)} 
                      onKeyDown={e => { 
                        if (e.key === 'Enter') { 
                          syncData('title', tempTitle); 
                          setIsEditingTitle(false); 
                        } 
                      }} 
                      onBlur={() => { 
                        syncData('title', tempTitle); 
                        setIsEditingTitle(false); 
                      }} 
                      className="text-3xl font-bold border-b-2 border-blue-500 bg-gray-50 outline-none w-full"
                    />
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900 tracking-tight truncate">
                        {appTitle}
                      </h1>
                      <button 
                        onClick={() => { 
                          setTempTitle(appTitle); 
                          setIsEditingTitle(true); 
                        }} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <Edit2 size={20} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">点击卡片进入对应场景清单</p>
              </div>

              {/* Category Grid */}
              <Reorder.Group 
                axis="y" 
                values={categories} 
                onReorder={handleReorderCategories}
                className="px-5 flex flex-col gap-4 pb-12"
              >
                {categories.map((cat) => {
                  const stats = getCategoryStats(cat.id);
                  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
                  const isEditing = editingCategoryId === cat.id;
                  const IconComp = ICON_MAP[cat.iconName] || ListPlus;
                  
                  return (
                    <Reorder.Item 
                      key={cat.id} 
                      value={cat}
                      layout
                      onClick={() => { if (!isEditing) setActiveTab(cat.id); }} 
                      className="relative overflow-hidden w-full p-5 rounded-3xl cursor-grab active:cursor-grabbing bg-white border border-gray-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-gray-300 shrink-0 cursor-row-resize opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={20} />
                        </div>
                        <div className={`p-4 rounded-2xl ${cat.iconBg} ${cat.textColor} shrink-0 shadow-xs`}>
                          <IconComp size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {isEditing ? (
                              <input 
                                autoFocus 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)} 
                                onKeyDown={e => { 
                                  if(e.key==='Enter') { 
                                    e.stopPropagation(); 
                                    saveCategoryName(cat.id); 
                                  } 
                                }} 
                                onBlur={() => saveCategoryName(cat.id)} 
                                className="text-lg font-bold border-b-2 border-blue-400 outline-none w-32 px-1" 
                                onClick={e=>e.stopPropagation()} 
                              />
                            ) : (
                              <>
                                <h2 className="text-lg font-bold text-gray-800 truncate">
                                  {cat.name}
                                </h2>
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={e => { e.stopPropagation(); setEditName(cat.name); setEditingCategoryId(cat.id); }} 
                                    className="p-1.5 text-gray-400 hover:text-blue-500"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  {cat.isCustom && (
                                    <button 
                                      onClick={e => deleteCategory(cat.id, e)} 
                                      className="p-1.5 text-red-400 hover:text-red-600"
                                    >
                                      <Trash2 size={16}/>
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-medium truncate">{cat.desc}</p>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end shrink-0 pl-4 border-l border-gray-50">
                        {stats.total > 0 ? (
                          <>
                            <span className="text-base font-bold text-gray-700">{stats.completed}/{stats.total}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">已完成</span>
                          </>
                        ) : (
                          <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-bold">去创建</span>
                        )}
                      </div>

                      {/* Progress Bar Background */}
                      {stats.total > 0 && (
                        <div className="absolute bottom-0 left-0 h-1.5 bg-gray-50 w-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full ${cat.activeBg}`}
                          />
                        </div>
                      )}
                    </Reorder.Item>
                  );
                })}
                
                <button 
                  onClick={handleAddCategory} 
                  className="w-full p-5 rounded-3xl border-2 border-dashed border-gray-200 text-[#6a6767] hover:bg-gray-50 active:scale-[0.97] transition-all flex items-center justify-center gap-3 mt-2 bg-white shadow-sm select-none"
                >
                  <FolderPlus size={24} className="text-[#6f6d6d]" /> 
                  <span className="font-bold text-sm">创建新清单</span>
                </button>
              </Reorder.Group>
            </motion.div>
          ) : currentCategory && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col bg-gray-50 h-full relative"
            >
              {/* Detail Header */}
              <div className="bg-white rounded-b-[32px] shadow-md z-20 shrink-0 overflow-hidden">
                <div className={`pt-16 pb-6 px-6 ${currentCategory.color}`}>
                  <div className="flex justify-between items-center mb-6">
                    <button 
                      onClick={() => setActiveTab('home')} 
                      className="p-3 rounded-2xl bg-white/80 text-gray-800 shadow-sm transition-transform active:scale-95"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className={`p-3 rounded-2xl bg-white/90 ${currentCategory.textColor} shadow-sm`}>
                      {React.createElement(ICON_MAP[currentCategory.iconName] || ListPlus, { size: 24 })}
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">{currentCategory.name}</h1>
                  
                  <div className="mt-6 flex justify-between text-sm text-gray-600 font-bold items-center">
                    <div className="flex gap-3 items-center">
                      <span className="bg-white/60 px-3 py-1 rounded-full text-xs">
                        精度: {categoryTasks.length === 0 ? 0 : Math.round((completedTasksCount / categoryTasks.length) * 100)}%
                      </span>
                      {completedTasksCount > 0 && (
                        <button 
                          onClick={resetCategoryTasks} 
                          className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white shadow-sm ring-1 ring-black/5 ${currentCategory.textColor} transition-transform active:scale-95`}
                        >
                          <RotateCcw size={12} />
                          重置
                        </button>
                      )}
                    </div>
                    <span className="text-gray-500">{completedTasksCount}/{categoryTasks.length} 项</span>
                  </div>
                  
                  <div className="mt-4 h-2.5 bg-white/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${categoryTasks.length === 0 ? 0 : (completedTasksCount / categoryTasks.length) * 100}%` }}
                      className={`h-full ${currentCategory.activeBg} shadow-sm`}
                    />
                  </div>
                </div>

                {/* Sub-tabs Selection for Addition */}
                <div className="px-4 py-4 flex overflow-x-auto gap-2 items-center no-scrollbar bg-white">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap pl-2">添加到:</span>
                  {SUB_CATEGORIES.map(sub => (
                    <button 
                      key={sub.id} 
                      onClick={() => setActiveSubTab(sub.id)} 
                      className={`whitespace-nowrap px-5 py-2 rounded-2xl text-sm font-bold transition-all ${
                        activeSubTab === sub.id 
                          ? `${currentCategory.activeBg} text-white shadow-lg shadow-blue-200/50` 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task List */}
              <div className="flex-1 overflow-y-auto px-5 py-8 pb-32 no-scrollbar">
                {categoryTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <ListTodo size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold">快来添加第一项吧</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {SUB_CATEGORIES.map(sub => {
                      const subTasks = categoryTasks.filter(t => t.subCategoryId === sub.id || (!t.subCategoryId && sub.id === 'general'));
                      if (subTasks.length === 0) return null;
                      
                      const subCompleted = subTasks.filter(t => t.isCompleted).length;
                      
                      return (
                        <div key={sub.id} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <div className={`w-1.5 h-4 rounded-full ${currentCategory.activeBg}`}></div>
                            <h3 className="text-base font-black text-gray-800">{sub.name}</h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">
                              {subCompleted}/{subTasks.length}
                            </span>
                          </div>
                          <Reorder.Group 
                            axis="y" 
                            values={subTasks} 
                            onReorder={(newOrder) => handleReorderTasks(newOrder, sub.id)}
                            className="grid grid-cols-2 gap-2"
                          >
                            {subTasks.map(task => (
                              <Reorder.Item 
                                key={task.id} 
                                value={task}
                                className={`flex items-center justify-between p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing transition-shadow ${
                                  task.isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-blue-100 hover:shadow-md'
                                }`}
                              >
                                <div className="flex-1 flex items-center gap-2 overflow-hidden group">
                                  <div className="text-gray-300 shrink-0 cursor-row-resize">
                                    <GripVertical size={14} />
                                  </div>
                                  <button 
                                    onClick={() => toggleTask(task.id)} 
                                    className="flex-1 flex items-center gap-2 text-left overflow-hidden"
                                  >
                                    <div className={`transition-colors shrink-0 ${task.isCompleted ? currentCategory.textColor : 'text-gray-200 group-hover:text-blue-200'}`}>
                                      {task.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                    </div>
                                    <span className={`text-xs font-bold truncate transition-all ${
                                      task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
                                    }`}>
                                      {task.text}
                                    </span>
                                  </button>
                                </div>
                                <button 
                                  onClick={() => deleteTask(task.id)} 
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 p-5 pb-8 z-30">
                <form 
                  onSubmit={handleAddTask} 
                  className="flex gap-3 max-w-md mx-auto"
                >
                  <input 
                    type="text" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder={`添加至【${subCategoryName(activeSubTab)}】...`} 
                    className="flex-1 bg-gray-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()} 
                    className={`p-4 rounded-2xl text-white shadow-lg transition-all active:scale-95 ${
                      inputText.trim() 
                        ? `${currentCategory.activeBg} shadow-blue-200/50` 
                        : 'bg-gray-300 shadow-none'
                    }`}
                  >
                    <Plus size={28} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function subCategoryName(id: string) {
  return SUB_CATEGORIES.find(s => s.id === id)?.name || '通用';
}
