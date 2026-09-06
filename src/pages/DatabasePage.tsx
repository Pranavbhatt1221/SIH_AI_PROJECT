import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  FileText,
  User,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const DatabasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'passports' | 'persons' | 'visas' | 'watchlist' | 'documents'>('passports');
  const [search, setSearch] = useState('');
  const [dataList, setDataList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Add record modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    passport_number: '',
    full_name: '',
    nationality: 'IND',
    date_of_birth: '15/08/2000',
    gender: 'M',
    status: 'VALID'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/api/database/passports';
      if (activeTab === 'persons') endpoint = '/api/database/persons';
      if (activeTab === 'visas') endpoint = '/api/database/visas';
      if (activeTab === 'watchlist') endpoint = '/api/database/watchlist';
      if (activeTab === 'documents') endpoint = '/api/database/identity-documents';

      const res = await fetch(`${endpoint}?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        if (activeTab === 'passports') setDataList(data.passports || []);
        else if (activeTab === 'persons') setDataList(data.persons || []);
        else if (activeTab === 'visas') setDataList(data.visas || []);
        else if (activeTab === 'watchlist') setDataList(data.watchlist || []);
        else if (activeTab === 'documents') setDataList(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching mock database', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, search]);

  const handleResetDatabase = async () => {
    if (confirm('Reset Mock Authorized Database back to initial 20+ fictional seed identities?')) {
      await fetch('/api/database/reset', { method: 'POST' });
      fetchData();
    }
  };

  const handleAddPassport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/database/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Add record error', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Authorized Identity Register</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Mock Authorized Verification Database</h1>
          <p className="text-xs text-slate-400">
            Persistent simulated government immigration database for border credential cross-referencing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetDatabase}
            className="px-3 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            title="Reset to default seed identities"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Seeds</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold tracking-wide transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mock Record</span>
          </button>
        </div>
      </div>

      {/* Prominent Fictional Disclaimer Banner */}
      <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 p-3.5 flex items-center space-x-3 text-xs text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <strong className="text-amber-300">DEMO DATA ONLY: </strong>
          This database is an internal prototype simulation and is NOT connected to any sovereign, Interpol, or live immigration authorities. All identities are fictional.
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-750 pb-3">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-bold">
          {[
            { id: 'passports', label: 'Passports' },
            { id: 'persons', label: 'Persons' },
            { id: 'visas', label: 'Visas' },
            { id: 'watchlist', label: 'Watchlist / Red Notice' },
            { id: 'documents', label: 'Identity Documents' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-navy-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Name, Number, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-750 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl bg-navy-900 border border-navy-750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-850 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">{activeTab === 'watchlist' ? 'Target Name' : 'Primary ID'}</th>
                <th className="py-3 px-4">Full Name / Details</th>
                <th className="py-3 px-4">Date of Birth / Issued</th>
                <th className="py-3 px-4">Nationality</th>
                <th className="py-3 px-4">Status / Alert</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 font-mono">
              {dataList.map((item, idx) => {
                const photoRef = item.photo_reference;
                return (
                  <tr key={idx} className="hover:bg-navy-850/50 transition-colors">
                    <td className="py-2 px-4">
                      <div className="w-9 h-11 rounded overflow-hidden bg-navy-950 border border-navy-700 flex items-center justify-center">
                        {photoRef ? (
                          <img src={photoRef} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {item.passport_number || item.person_id || item.visa_number || item.document_number || item.watchlist_id}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-white">
                      {item.full_name || item.reason || item.visa_type || item.document_type}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.date_of_birth || item.issue_date || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.nationality || 'IND'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={item.status || item.risk_level || 'VALID'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="px-2.5 py-1 rounded bg-navy-800 hover:bg-cyan-500/20 text-cyan-400 border border-navy-700 text-[10px] font-sans font-bold transition-colors cursor-pointer"
                      >
                        View File
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspector Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Authorized Record Dossier</span>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            {selectedRecord.photo_reference && (
              <div className="w-28 h-36 mx-auto rounded-lg overflow-hidden border border-navy-700 bg-navy-950 p-1">
                <img src={selectedRecord.photo_reference} alt="Portrait" className="w-full h-full object-cover rounded" />
              </div>
            )}

            <div className="space-y-2 text-xs font-mono">
              <pre className="p-3 rounded bg-navy-950 border border-navy-800 text-slate-300 overflow-x-auto text-[11px]">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Add Mock Passport Record</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleAddPassport} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newRecord.full_name}
                  onChange={(e) => setNewRecord({ ...newRecord, full_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Passport Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. P7788990"
                  value={newRecord.passport_number}
                  onChange={(e) => setNewRecord({ ...newRecord, passport_number: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    required
                    value={newRecord.date_of_birth}
                    onChange={(e) => setNewRecord({ ...newRecord, date_of_birth: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Status</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  >
                    <option value="VALID">VALID</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="BLACKLISTED">BLACKLISTED</option>
                    <option value="REVOKED">REVOKED</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded bg-navy-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
