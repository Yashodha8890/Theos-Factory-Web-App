const LoadingSpinner = ({ label = 'Loading' }) => (
  <div className="flex min-h-[240px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-full border px-5 py-3 text-sm muted" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      {label}
    </div>
  </div>
);

export default LoadingSpinner;
