import { useMemo, useState } from 'react';
import { Download, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import { useAuth } from '../../contexts/AuthContext';
import { company } from '../../data/siteData';
import { getErrorMessage, splitName } from '../../utils/format';

const ProfileDetails = () => {
  const { user, updateProfile } = useAuth();
  const initialName = useMemo(() => splitName(user?.name), [user?.name]);
  const [form, setForm] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        avatar: form.avatar,
        ...(form.password ? { password: form.password } : {}),
      });
      setMessage('Profile updated successfully.');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (error) {
      setMessage(getErrorMessage(error, 'Profile update failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Account & Profile</p>
        <h1 className="display mt-3 text-4xl font-bold md:text-6xl">Account Management</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 muted">Manage personal information, security preferences, and event communication settings.</p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <form onSubmit={handleSubmit} className="card p-6 md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <h2 className="display flex items-center gap-4 text-3xl font-bold"><UserRound className="text-accent-600" /> Personal Details</h2>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <FormInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
            <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
            <FormInput className="md:col-span-2" label="Email Address" value={user?.email || ''} readOnly />
            <FormInput label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder={company.phone} />
            <FormInput label="Avatar URL" name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://..." />
            <FormInput className="md:col-span-2" label="New Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
          </div>
          {message && <p className={`mt-6 text-sm font-semibold ${message.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{message}</p>}
        </form>

        <aside className="space-y-6">
          <article className="rounded-lg bg-brand-950 p-8 text-white shadow-lift">
            <h2 className="display flex items-center gap-3 text-3xl font-bold"><ShieldCheck className="text-accent-400" /> Security</h2>
            <div className="mt-8 space-y-4">
              <div className="rounded-md bg-white/10 p-5">Update Password</div>
              <div className="rounded-md bg-white/10 p-5">Two-Factor Auth <span className="float-right rounded bg-accent-500 px-2 py-1 text-xs font-bold text-brand-950">Enabled</span></div>
              <div className="rounded-md bg-white/10 p-5">Login Activity</div>
            </div>
          </article>
          <article className="card p-8">
            <h2 className="display text-2xl font-bold">Concierge Preferences</h2>
            <label className="mt-8 flex items-center justify-between">
              <span><strong>SMS Notifications</strong><span className="block text-sm muted">Real-time event updates</span></span>
              <input type="checkbox" defaultChecked className="h-6 w-11 rounded-full p-0" />
            </label>
          </article>
        </aside>
      </section>

      <section className="card flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="display text-3xl font-bold">Privacy & Data</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 muted">Download a complete archive of your event history or manage account status.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-outline"><Download size={16} /> Download Data</button>
          <Link to="/dashboard/delete" className="btn bg-red-600 text-white hover:bg-red-700"><Trash2 size={16} /> Delete Account</Link>
        </div>
      </section>
    </div>
  );
};

export default ProfileDetails;
