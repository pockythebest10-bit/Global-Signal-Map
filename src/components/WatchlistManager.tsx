import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WatchlistItem } from '../types';
import { X, Search, Plus, Star, Volume2, VolumeX, ShieldAlert, Settings2, Trash2, Edit2, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface WatchlistManagerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: WatchlistItem[];
  onUpdateWatchlist: (newList: WatchlistItem[]) => void;
}

const TYPE_COLORS: Record<string, string> = {
  country: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20',
  company: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  sector: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  commodity: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  theme: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  person: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  city: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  event_type: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  keyword: 'text-white/60 bg-white/5 border-white/10'
};

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({ isOpen, onClose, watchlist, onUpdateWatchlist }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newType, setNewType] = useState<WatchlistItem['type']>('keyword');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeyword, setEditKeyword] = useState('');
  const [editType, setEditType] = useState<WatchlistItem['type']>('keyword');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const newItem: WatchlistItem = {
      id: `wl-${Date.now()}`,
      keyword: newKeyword.trim(),
      type: newType,
      addedAt: new Date(),
      sensitivity: 'normal',
      isPinned: false
    };

    onUpdateWatchlist([newItem, ...watchlist]);
    setNewKeyword('');
  };

  const handleRemove = (id: string) => {
    onUpdateWatchlist(watchlist.filter(item => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const togglePin = (id: string) => {
    onUpdateWatchlist(watchlist.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    ));
  };

  const cycleSensitivity = (id: string) => {
    onUpdateWatchlist(watchlist.map(item => {
      if (item.id !== id) return item;
      const current = item.sensitivity || 'normal';
      const next = current === 'normal' ? 'high' : current === 'high' ? 'muted' : 'normal';
      return { ...item, sensitivity: next };
    }));
  };

  const startEdit = (item: WatchlistItem) => {
    setEditingId(item.id);
    setEditKeyword(item.keyword);
    setEditType(item.type);
  };

  const saveEdit = () => {
    if (!editingId || !editKeyword.trim()) return;
    onUpdateWatchlist(watchlist.map(item => 
      item.id === editingId ? { ...item, keyword: editKeyword.trim(), type: editType } : item
    ));
    setEditingId(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= watchlist.length) return;
    const newList = [...watchlist];
    const temp = newList[index];
    newList[index] = newList[index + direction];
    newList[index + direction] = temp;
    onUpdateWatchlist(newList);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[40] pointer-events-auto bg-black/20 md:bg-transparent" 
            onClick={onClose} 
          />

          <motion.div 
            initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed md:absolute left-4 right-4 md:right-auto md:left-[296px] lg:left-[316px] top-[88px] md:w-[320px] lg:w-[360px] max-h-[calc(100vh-104px)] z-50 bg-[#0a0a0c]/95 md:bg-[#0a0a0c]/90 backdrop-blur-[20px] border border-white/5 rounded-xl shadow-2xl flex flex-col pointer-events-auto font-sans overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-medium text-white tracking-tight leading-tight">Calibrated Array</h2>
                  <p className="text-[11px] text-text-tertiary mt-0.5 leading-tight">Priority intel targets</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-text-tertiary hover:text-white hover:bg-white/5 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add form */}
            <div className="p-4 border-b border-white/5 bg-black/20">
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                <div className="flex gap-0 h-[36px] bg-[#121214] border border-white/10 rounded-md overflow-hidden focus-within:border-brand-500/40 focus-within:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all">
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="bg-transparent text-[11px] font-mono text-white/70 px-2 outline-none border-r border-white/10 cursor-pointer hover:bg-white/5 appearance-none min-w-[90px]"
                  >
                    <option value="country">COUNTRY</option>
                    <option value="city">CITY</option>
                    <option value="company">COMPANY</option>
                    <option value="sector">SECTOR</option>
                    <option value="person">PERSON</option>
                    <option value="commodity">COMMODITY</option>
                    <option value="theme">THEME</option>
                    <option value="event_type">EVENT</option>
                    <option value="keyword">KEYWORD</option>
                  </select>
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add target..."
                    className="flex-1 bg-transparent text-[13px] text-white px-3 outline-none placeholder:text-text-tertiary"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newKeyword.trim()}
                  className="h-[36px] w-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium text-[12px] rounded-md hover:bg-brand-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors tracking-wide flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  TRACK TARGET
                </button>
              </form>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-[#050505]/50">
              {watchlist.length === 0 ? (
                <div className="text-center mt-12 text-text-tertiary text-[12px] flex flex-col items-center px-4">
                  <div className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center mb-3">
                    <Search className="w-4 h-4 opacity-50 text-text-tertiary" />
                  </div>
                  Array is unconfigured.<br/>Add targets to prioritize signals.
                </div>
              ) : (
                watchlist.map((item, index) => {
                  const sensitivity = item.sensitivity || 'normal';
                  const isEditing = editingId === item.id;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={cn(
                        "group relative flex flex-col p-3 bg-[#0a0a0c] border rounded-lg transition-all",
                        item.isPinned ? "border-brand-500/30 shadow-[0_0_10px_rgba(212,175,55,0.05)]" : "border-white/5 hover:border-white/10"
                      )}
                    >
                      {isEditing ? (
                        /* EDIT MODE */
                        <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
                          <div className="flex h-[32px] bg-black/40 border border-white/20 rounded overflow-hidden">
                            <select 
                              value={editType} 
                              onChange={(e) => setEditType(e.target.value as any)}
                              className="bg-transparent text-[10px] font-mono text-white/80 px-2 outline-none border-r border-white/10 cursor-pointer min-w-[80px]"
                            >
                              <option value="country">COUNTRY</option>
                              <option value="city">CITY</option>
                              <option value="company">COMPANY</option>
                              <option value="sector">SECTOR</option>
                              <option value="person">PERSON</option>
                              <option value="commodity">COMMODITY</option>
                              <option value="theme">THEME</option>
                              <option value="event_type">EVENT</option>
                              <option value="keyword">KEYWORD</option>
                            </select>
                            <input
                              type="text"
                              value={editKeyword}
                              onChange={(e) => setEditKeyword(e.target.value)}
                              className="flex-1 bg-transparent text-[12px] text-white px-2 outline-none"
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2">
                             <button type="submit" className="flex-1 h-[28px] bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[11px] font-medium tracking-wide rounded flex items-center justify-center hover:bg-brand-500/20">
                               SAVE
                             </button>
                             <button type="button" onClick={() => setEditingId(null)} className="px-3 h-[28px] bg-white/5 border border-white/10 text-text-secondary text-[11px] font-medium tracking-wide rounded flex items-center justify-center hover:bg-white/10 hover:text-white">
                               CANCEL
                             </button>
                          </div>
                        </form>
                      ) : (
                        /* DISPLAY MODE */
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-1.5">
                               <div className={cn(
                                  "inline-flex text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-[3px] border",
                                  TYPE_COLORS[item.type] || TYPE_COLORS.keyword
                                )}>
                                  {item.type.replace('_', ' ')}
                               </div>
                               {item.isPinned && <Star className="w-3 h-3 fill-brand-400 text-brand-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />}
                               {sensitivity === 'high' && <ShieldAlert className="w-3 h-3 text-red-500" />}
                               {sensitivity === 'muted' && <VolumeX className="w-3 h-3 text-text-tertiary" />}
                            </div>
                            <div className={cn(
                               "text-[13px] font-medium tracking-tight truncate",
                               item.sensitivity === 'muted' ? "text-text-tertiary line-through decoration-white/20" : "text-white"
                            )}>
                              {item.keyword}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                             <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => togglePin(item.id)}
                                  className="w-[24px] h-[24px] flex justify-center items-center rounded border border-white/5 bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white transition-colors"
                                  title={item.isPinned ? "Unpin target" : "Pin target for priority intelligence"}
                                >
                                  <Star className={cn("w-3 h-3", item.isPinned ? "text-brand-400" : "")} />
                                </button>
                                <button 
                                  onClick={() => cycleSensitivity(item.id)}
                                  className="w-[24px] h-[24px] flex justify-center items-center rounded border border-white/5 bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white transition-colors"
                                  title="Cycle sensitivity (Normal / High / Muted)"
                                >
                                  {sensitivity === 'normal' && <Volume2 className="w-3 h-3" />}
                                  {sensitivity === 'high' && <ShieldAlert className="w-3 h-3 text-red-500" />}
                                  {sensitivity === 'muted' && <VolumeX className="w-3 h-3" />}
                                </button>
                                <button 
                                  onClick={() => startEdit(item)}
                                  className="w-[24px] h-[24px] flex justify-center items-center rounded border border-white/5 bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleRemove(item.id)}
                                  className="w-[24px] h-[24px] flex justify-center items-center rounded border border-white/5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20 text-text-tertiary transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                             </div>
                             
                             <div className="flex items-center gap-1">
                                <button onClick={() => moveItem(index, -1)} disabled={index === 0} className="text-text-tertiary hover:text-white disabled:opacity-30 p-0.5">
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button onClick={() => moveItem(index, 1)} disabled={index === watchlist.length - 1} className="text-text-tertiary hover:text-white disabled:opacity-30 p-0.5">
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

