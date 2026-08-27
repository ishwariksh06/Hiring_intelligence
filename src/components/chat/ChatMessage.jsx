import MatchScoreBadge from '../candidates/MatchScoreBadge';
import SkillTag from '../candidates/SkillTag';
import { Link } from 'react-router-dom';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
        <p>{message.text}</p>
        {message.candidates && message.candidates.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.candidates.map((c) => (
              <Link
                key={c.candidateId}
                to={`/candidates/${c.candidateId}`}
                className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.skills.slice(0, 4).map((s) => (
                      <SkillTag key={s}>{s}</SkillTag>
                    ))}
                  </div>
                </div>
                <MatchScoreBadge score={c.bestMatchScore} showLabel={false} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
