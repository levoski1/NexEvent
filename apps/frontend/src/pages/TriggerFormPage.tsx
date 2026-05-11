import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateTrigger, useUpdateTrigger, useTrigger } from '../hooks/useTriggers';
import type { ActionType } from '@nexevent/shared-types';

const ACTION_TYPES: ActionType[] = ['webhook', 'discord', 'telegram', 'email'];

export function TriggerFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: existing } = useTrigger(id ?? '');
  const createTrigger = useCreateTrigger();
  const updateTrigger = useUpdateTrigger(id ?? '');

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    actionType: (existing?.actionType ?? 'webhook') as ActionType,
    contractId: existing?.filter.contractId ?? '',
    eventType: existing?.filter.eventType ?? '',
    webhookUrl: '',
    discordWebhookUrl: '',
    telegramChatId: '',
    emailTo: '',
    messageTemplate: 'Event {{type}} on contract {{contractId}} at ledger {{ledger}}',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const buildActionConfig = () => {
    switch (form.actionType) {
      case 'webhook': return { url: form.webhookUrl, method: 'POST' as const };
      case 'discord': return { webhookUrl: form.discordWebhookUrl, messageTemplate: form.messageTemplate };
      case 'telegram': return { chatId: form.telegramChatId, messageTemplate: form.messageTemplate };
      case 'email': return { to: form.emailTo.split(',').map((e) => e.trim()), subject: 'NexEvent Alert', bodyTemplate: form.messageTemplate };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      actionType: form.actionType,
      actionConfig: buildActionConfig(),
      filter: { contractId: form.contractId || undefined, eventType: form.eventType || undefined },
    };
    const op = isEdit ? updateTrigger.mutateAsync(payload) : createTrigger.mutateAsync(payload);
    await toast.promise(op, {
      loading: isEdit ? 'Updating…' : 'Creating…',
      success: isEdit ? 'Trigger updated' : 'Trigger created',
      error: (e) => e.message,
    });
    navigate('/triggers');
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500';
  const labelCls = 'block text-sm text-gray-400 mb-1';

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Trigger' : 'New Trigger'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Name *</label>
          <input required className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <input className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Contract ID (filter)</label>
            <input className={inputCls} placeholder="C..." value={form.contractId} onChange={(e) => set('contractId', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Event Type (filter)</label>
            <input className={inputCls} placeholder="transfer" value={form.eventType} onChange={(e) => set('eventType', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Action Type *</label>
          <select className={inputCls} value={form.actionType} onChange={(e) => set('actionType', e.target.value)}>
            {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {form.actionType === 'webhook' && (
          <div>
            <label className={labelCls}>Webhook URL *</label>
            <input required className={inputCls} type="url" value={form.webhookUrl} onChange={(e) => set('webhookUrl', e.target.value)} />
          </div>
        )}
        {form.actionType === 'discord' && (
          <div>
            <label className={labelCls}>Discord Webhook URL *</label>
            <input required className={inputCls} type="url" value={form.discordWebhookUrl} onChange={(e) => set('discordWebhookUrl', e.target.value)} />
          </div>
        )}
        {form.actionType === 'telegram' && (
          <div>
            <label className={labelCls}>Telegram Chat ID *</label>
            <input required className={inputCls} value={form.telegramChatId} onChange={(e) => set('telegramChatId', e.target.value)} />
          </div>
        )}
        {form.actionType === 'email' && (
          <div>
            <label className={labelCls}>To (comma-separated emails) *</label>
            <input required className={inputCls} value={form.emailTo} onChange={(e) => set('emailTo', e.target.value)} />
          </div>
        )}
        {form.actionType !== 'webhook' && (
          <div>
            <label className={labelCls}>Message Template</label>
            <textarea rows={3} className={inputCls} value={form.messageTemplate} onChange={(e) => set('messageTemplate', e.target.value)} />
            <p className="text-xs text-gray-500 mt-1">Use {'{{type}}'}, {'{{contractId}}'}, {'{{ledger}}'}, {'{{txHash}}'}</p>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-5 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium">
            {isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/triggers')} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
