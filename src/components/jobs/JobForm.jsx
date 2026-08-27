import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export default function JobForm({ defaultValues, onSubmit, submitLabel = 'Create Job' }) {
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
      minExperience: defaultValues?.minExperience ?? 0,
      maxExperience: defaultValues?.maxExperience ?? 5,
    },
  });

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
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

  function removeSkill(skill) {
    setSkills(skills.filter((s) => s !== skill));
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
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Job Title</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Senior Backend Engineer"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={5}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Describe the role, responsibilities, and expectations..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Required Skills</label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-slate-300 px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          {skills.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-indigo-700">
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
            placeholder={skills.length === 0 ? 'Type a skill and press Enter' : 'Add another skill'}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">Press Enter or comma to add a skill</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Min Experience (years)</label>
          <input
            type="number"
            min="0"
            {...register('minExperience', { required: true, min: 0 })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Max Experience (years)</label>
          <input
            type="number"
            min="0"
            {...register('maxExperience', { required: true, min: 0 })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => navigate('/jobs')}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
