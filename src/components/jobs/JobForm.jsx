import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

export default function JobForm({ defaultValues, onSubmit, submitLabel = 'Create job', companies = [], lockedCompanyName }) {
  const navigate = useNavigate();
  const [skills, setSkills] = useState(defaultValues?.requiredSkills || []);
  const [skillInput, setSkillInput] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      companyId: defaultValues?.companyId || (companies[0]?.id ?? ''),
      minExperience: defaultValues?.minExperience ?? 0,
      maxExperience: defaultValues?.maxExperience ?? 5,
    },
  });

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput('');
  }

  function handleSkillKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  }

  async function submitHandler(values) {
    await onSubmit({
      ...values,
      minExperience: Number(values.minExperience),
      maxExperience: Number(values.maxExperience),
      requiredSkills: skills,
    });
  }

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
      {companies.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Client company</label>
          <select {...register('companyId', { required: true })} className={inputClass}>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {lockedCompanyName && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Client company</label>
          <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{lockedCompanyName}</p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Job title</label>
        <input {...register('title', { required: 'Title is required' })} className={inputClass} placeholder="e.g. Senior Backend Engineer" />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Job description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={5}
          className={inputClass}
          placeholder="Responsibilities, team, expectations..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Required skills</label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-slate-300 px-2 py-1.5 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500">
          {skills.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {skill}
              <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))} className="text-slate-400 hover:text-slate-700">
                &times;
              </button>
            </span>
          ))}
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            onBlur={addSkill}
            className="min-w-[120px] flex-1 border-none px-1 py-1 text-sm outline-none"
            placeholder={skills.length === 0 ? 'Type a skill, press Enter' : 'Add another'}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">These drive the match score. Use the same names as on resumes (e.g. "Spring Boot").</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Min experience (yrs)</label>
          <input type="number" min="0" {...register('minExperience', { required: true, min: 0 })} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Max experience (yrs)</label>
          <input type="number" min="0" {...register('maxExperience', { required: true, min: 0 })} className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
