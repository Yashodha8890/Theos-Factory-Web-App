import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/format';

const DeleteAccount = () => {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Account deletion failed'));
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Account Removal</p>
        <h1 className="display mt-3 text-4xl font-bold md:text-6xl">Delete Account</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 muted">Permanently delete your profile and account-related appointment, quotation, and rental records.</p>
      </section>

      <section className="rounded-lg border border-red-300 bg-red-50 p-8 text-red-950 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-100">
        <AlertTriangle size={34} />
        <h2 className="display mt-6 text-3xl font-bold">Danger Zone</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7">This action is permanent. You will lose access to your dashboard and all user-specific records will be removed.</p>
        <button type="button" onClick={() => setConfirmOpen(true)} className="btn mt-8 bg-red-600 text-white hover:bg-red-700">
          <Trash2 size={16} /> Delete My Account
        </button>
        {message && <p className="mt-5 text-sm font-semibold">{message}</p>}
      </section>

      {confirmOpen && (
        <Modal
          title="Confirm Account Deletion"
          message="Are you sure you want to delete your account? This cannot be undone."
          confirmText={loading ? 'Deleting...' : 'Delete Account'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          danger
        />
      )}
    </div>
  );
};

export default DeleteAccount;
