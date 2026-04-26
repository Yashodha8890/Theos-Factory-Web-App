import { Link } from 'react-router-dom';

const EmptyState = ({ title, message, actionLabel, actionTo }) => (
  <div className="card p-10 text-center">
    <h3 className="display text-2xl font-bold">{title}</h3>
    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 muted">{message}</p>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-accent mt-6">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
