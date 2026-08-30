import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createCompany, getCompanies } from '../api/companiesApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  function load() {
    return getCompanies().then((data) => {
      setCompanies(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values) {
    await createCompany(values);
    reset();
    setOpen(false);
    await load();
  }

  if (loading) return <Loader label="Loading companies..." />;

  return (
    <>
      <Card
        title={`Client companies (${companies.length})`}
        action={<Button size="sm" onClick={() => setOpen(true)}>Add company</Button>}
        bodyClassName="p-0"
      >
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              {['Company', 'Industry', 'Open jobs', 'Shortlisted', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((c) => (
              <tr key={c.id} onClick={() => navigate(`/companies/${c.id}`)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.location}</p>
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-600">{c.industry || '—'}</td>
                <td className="px-4 py-2.5 text-sm text-slate-600">{c.openJobs}</td>
                <td className="px-4 py-2.5 text-sm text-slate-600">{c.shortlistedCandidates}</td>
                <td className="px-4 py-2.5 text-right text-[11px] font-medium text-slate-500">Open →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add client company"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>Add company</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Company name</label>
            <input {...register('name', { required: true })} className={inputClass} placeholder="Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Industry</label>
              <input {...register('industry')} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
              <input {...register('location')} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Contact name</label>
              <input {...register('contactName')} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Contact email</label>
              <input {...register('contactEmail')} className={inputClass} />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
