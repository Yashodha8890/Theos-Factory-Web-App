export const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
};

export const formatCurrency = (value) => (
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
);

export const formatBudgetRange = (value) => String(value || '').replace(/\$/g, '€');

export const getErrorMessage = (error, fallback = 'Something went wrong') => (
  error?.response?.data?.message || error?.message || fallback
);

export const splitName = (value = '') => {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

export const formatNumber = (value) => (
  new Intl.NumberFormat('en-US').format(Number(value || 0))
);
