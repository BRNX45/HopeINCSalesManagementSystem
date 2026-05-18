import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login, googleSignIn, authError } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const errorCode = searchParams.get('error');

    if (errorCode === 'not_activated') {
      setError('Your account is not activated. Contact your administrator.');
    } else if (errorCode === 'oauth_failed') {
      setError('OAuth sign-in failed. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message || 'Unable to sign in.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="text-muted">Use your email and password or sign in with Google.</p>
        <button className="button button--google" onClick={googleSignIn}>
          Sign in with Google
        </button>
        <div className="divider">Or continue with</div>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>
          <button className="button button--primary" type="submit">
            Sign in
          </button>
        </form>
        <p className="text-center">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
