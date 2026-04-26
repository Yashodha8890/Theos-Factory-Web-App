const FormInput = ({
  label,
  error,
  required,
  as = 'input',
  children,
  className = '',
  ...props
}) => {
  const Component = as;

  return (
    <label className="block space-y-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] muted">
          {label}
          {required && <span className="ml-1 text-accent-600">*</span>}
        </span>
      )}
      <Component
        className={`${error ? 'border-red-500' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </Component>
      {error && <span className="block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
};

export default FormInput;
