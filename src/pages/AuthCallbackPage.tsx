import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }

      setLoading(false);
    };

    processOAuthCallback();
  }, [navigate]);

  return (
    <div className="auth-page auth-page--callback">
      <div className="callback-card">
        <div className="spinner" />
        <h2>Processing OAuth sign-in</h2>
        <p>We are exchanging your session and redirecting you to the app.</p>
        {loading && <p className="text-muted">Please wait...</p>}
      </div>
    </div>
  );
}
