import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Keypad } from '../components/Keypad.jsx';
import { ArrowLeft } from '../components/Icons.jsx';
import { registerPhone } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

const DEMO_PHONE = '9818979450';

function formatPhoneValue(value) {
  return value.length > 5 ? `${value.slice(0, 5)} ${value.slice(5)}` : value;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const addDigit = (digit) => {
    setPhone((current) => (current.length >= 10 ? current : current + digit));
    setError('');
  };

  const removeDigit = () => {
    setPhone((current) => current.slice(0, -1));
    setError('');
  };

  const handlePhoneChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerPhone(phone);
      window.sessionStorage.setItem('craving.pendingPhone', phone);
      navigate('/verify', { state: { phone } });
    } catch (requestError) {
      setError(requestError.message || 'Could not send the OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="screen auth-screen">
      <button
        className="back-button"
        type="button"
        onClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
        aria-label="Go back"
      >
        <ArrowLeft />
      </button>

      <header className="auth-heading">
        <h1>Sign Up to Fastor</h1>
        <p className="muted">
          Let us know your mobile number and we will send you an OTP for verification.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className={`phone-field ${error ? 'has-error' : ''}`}>
          <span className="phone-code">+91</span>
          <span className="phone-divider" aria-hidden="true" />
          <input
            className="phone-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            aria-label="Mobile number"
            placeholder="- 00000"
            value={formatPhoneValue(phone)}
            onChange={handlePhoneChange}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button
          type="button"
          className="demo-hint"
          onClick={() => {
            setPhone(DEMO_PHONE);
            setError('');
          }}
        >
          Demo number <strong>{DEMO_PHONE}</strong> · OTP <strong>123456</strong>
        </button>

        <div className="auth-bottom">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Sending OTP…' : 'Get OTP'}
          </button>
          <p className="terms">
            By clicking, I accept the <span>Terms &amp; Conditions</span> and{' '}
            <span>Privacy Policy</span>.
          </p>
        </div>
      </form>

      <Keypad onDigit={addDigit} onBackspace={removeDigit} />
    </main>
  );
}
