import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchBatchData } from '../../state/batch/batch.action';
import { batchSelector, clearRemoveMessage } from '../../state/batch/batch.reducer';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import { Database, Plus, Search, Edit2, Trash2, Circle } from 'lucide-react';

const BatchPage: React.FC = () => {
  const dispatch = useDispatch();
  const { batchData } = useSelector(batchSelector);

  useEffect(() => {
    dispatch(searchBatchData({}) as any);
    return () => {
      dispatch(clearRemoveMessage());
    };
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="text-[#6366F1]" />
            Batch Management
          </h1>
          <p className="text-sm text-[#6B7280]">Manage academic batches and schedules</p>
        </div>
        <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2">
          <Plus size={18} />
          Create New Batch
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E5E7EB] flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search batches..."
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#6366F1]/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50 border-b border-[#E5E7EB]">
              <tr>
                <th className="p-4 font-semibold text-[#6B7280]">Batch Name</th>
                <th className="p-4 font-semibold text-[#6B7280]">Code</th>
                <th className="p-4 font-semibold text-[#6B7280]">Duration</th>
                <th className="p-4 font-semibold text-[#6B7280]">Status</th>
                <th className="p-4 font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {batchData.loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading batches...</td>
                </tr>
              ) : batchData.data.rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No batches found.</td>
                </tr>
              ) : (
                batchData.data.rows.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{batch.name}</td>
                    <td className="p-4 text-[#6B7280]">{batch.code}</td>
                    <td className="p-4">{batch.duration} Months</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Circle size={8} fill={batch.status ? '#059669' : '#6B7280'} className={batch.status ? 'text-[#059669]' : 'text-[#6B7280]'} />
                        <span className={batch.status ? 'text-[#059669]' : 'text-[#6B7280]'}>
                          {batch.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#E5E7EB]">
          <PaginationComponent meta={batchData.data.meta} />
        </div>
      </div>
    </div>
  );
};

export default BatchPage;
