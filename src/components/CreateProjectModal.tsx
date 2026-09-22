import React, { useState } from 'react';
import { Project } from '../types';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { FolderGit2, GitBranch, Plus, X, AlertCircle } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject?: (projectData: Partial<Project>) => Promise<void> | void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [name, setName] = useState('');
  const [repository, setRepository] = useState('');
  const [branch, setBranch] = useState('main');
  const [environment, setEnvironment] = useState<'development' | 'testing' | 'staging' | 'production'>('production');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Service / Project name is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      let repoUrl = repository.trim();
      if (!repoUrl) {
        repoUrl = `https://github.com/enterprise/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      } else if (!repoUrl.startsWith('http://') && !repoUrl.startsWith('https://') && !repoUrl.startsWith('git@')) {
        repoUrl = `https://${repoUrl}`;
      }

      if (onCreateProject) {
        await onCreateProject({
          name: name.trim(),
          repository: repoUrl,
          branch: branch.trim() || 'main',
          environment,
          description: description.trim() || `Managed microservice ${name.trim()}`
        });
      }

      // Reset form
      setName('');
      setRepository('');
      setBranch('main');
      setEnvironment('production');
      setDescription('');
      onClose();
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err?.message || 'Failed to create project. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <GlassCard className="w-full max-w-lg p-6 shadow-2xl relative border-white/90 bg-white/95">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 shadow-xs">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-wide text-slate-900">
                Create New Project
              </h2>
              <p className="text-xs text-slate-500">
                Register a microservice for telemetry, CI/CD pipelines &amp; self-healing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Service / Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Payment Gateway API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Git Repository URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/enterprise/payment-gateway"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              className="w-full bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-mono placeholder:text-slate-400 shadow-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1 font-sans">
              HTTPS or SSH URL. If left empty, an enterprise placeholder is generated automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                Default Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-mono shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium cursor-pointer shadow-xs"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Service Description
            </label>
            <textarea
              rows={2}
              placeholder="High-throughput payment gateway processing synchronous transactions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60 mt-5">
            <GlassButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Project
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
