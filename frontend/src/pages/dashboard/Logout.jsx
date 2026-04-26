import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Logout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      signOut();
      navigate('/');
    }, 500);
    return () => clearTimeout(timer);
  }, [navigate, signOut]);

  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <LogOut className="mx-auto text-accent-600" size={36} />
      <h1 className="display mt-6 text-3xl font-bold">Signing you out</h1>
      <p className="mt-3 text-sm muted">Your session is being closed.</p>
    </div>
  );
};

export default Logout;
