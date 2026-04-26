import { Link } from 'react-router-dom';
import { CalendarDays, Mail, Phone, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';

const MyProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">My Profile</p>
        <h1 className="display mt-3 text-4xl font-bold md:text-6xl">{user?.name}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 muted">Your account identity, contact details, and access preferences.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="card p-8 text-center">
          <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-accent-100 text-accent-900">
            {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : <UserRound size={42} />}
          </div>
          <h2 className="display mt-6 text-3xl font-bold">{user?.name}</h2>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] muted">Guest User</p>
          <Link to="/dashboard/account" className="btn-primary mt-8 w-full">Edit Profile</Link>
        </article>

        <article className="card p-8">
          <h2 className="display text-3xl font-bold">Profile Details</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="panel p-5">
              <Mail className="text-accent-600" />
              <p className="mt-5 text-xs uppercase tracking-[0.18em] muted">Email</p>
              <p className="mt-2 font-semibold">{user?.email}</p>
            </div>
            <div className="panel p-5">
              <Phone className="text-accent-600" />
              <p className="mt-5 text-xs uppercase tracking-[0.18em] muted">Phone</p>
              <p className="mt-2 font-semibold">{user?.phone || 'Not provided'}</p>
            </div>
            <div className="panel p-5 md:col-span-2">
              <CalendarDays className="text-accent-600" />
              <p className="mt-5 text-xs uppercase tracking-[0.18em] muted">Member Since</p>
              <p className="mt-2 font-semibold">{formatDate(user?.createdAt || new Date())}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default MyProfile;
