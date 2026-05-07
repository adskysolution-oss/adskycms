'use client';
import { useState } from 'react';
import { Search, MoreVertical, Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDataTable({ 
  title, 
  data, 
  columns, 
  onDelete, 
  onEdit, 
  onCreate,
  loading 
}) {
  const [search, setSearch] = useState('');

  const filteredData = data?.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onCreate && (
          <button 
            onClick={onCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create New
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text"
          placeholder="Search..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              {columns.map(col => (
                <th key={col.key} className="px-6 py-4 text-sm font-semibold">{col.label}</th>
              ))}
              <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={columns.length + 1} className="px-6 py-8 bg-slate-950/20"></td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500">
                  No data found.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 text-sm">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item._id)}
                          className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
