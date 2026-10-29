import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons.jsx';
import { Keypad } from '../components/Keypad.jsx';
import { loginWithOtp, registerPhone } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

function formatPhone(phone) {
  if (!phone) return '';
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useAuth();
  const phone = useMemo(
    () => location.state?.phone || window.sessionStorage.getItem('craving.pendingPhone') || '',
    [location.state],
  );
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [seconds]);

  if (!phone) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const otp = digits.join('');

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    setError('');

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const addDigit = (digit) => {
    const firstEmpty = digits.findIndex((value) => !value);
    if (firstEmpty === -1) return;
    setDigit(firstEmpty, digit);
  };

  const removeDigit = () => {
    const lastFilled = [...digits].reduce((last, value, index) => (value ? index : last), -1);
    if (lastFilled < 0) return;
    setDigit(lastFilled, '');
    inputs.current[lastFilled]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);
    if (!pasted) return;
    event.preventDefault();

    setDigits((current) => {
      const next = [...current];
      pasted.split('').forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      return next;
    });

    const target = Math.min(index + pasted.length, 5);
    inputs.current[target]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setError('Enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const data = await loginWithOtp(phone, otp);
      signIn(data);
      window.sessionStorage.removeItem('craving.pendingPhone');
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'That code did not work. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    setNotice('');
    setLoading(true);

    try {
      await registerPhone(phone);
      setDigits(Array(6).fill(''));
      setSeconds(30);
      setNotice('A fresh OTP is on its way.');
      inputs.current[0]?.focus();
    } catch (requestError) {
      setError(requestError.message || 'Could not resend the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="screen auth-screen">
      <button className="back-button" type="button" onClick={() => navigate('/login')} aria-label="Go back">
        <ArrowLeft />
      </button>

      <header className="auth-heading">
        <h1>6-digit code</h1>
        <p className="muted">
          Please enter the code we&apos;ve sent to <strong>{formatPhone(phone)}</strong>
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="otp-row" role="group" aria-label="6-digit verification code">
          {digits.map((digit, index) => (
            <div className="otp-cell-wrap" key={index}>
              <input
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                className="otp-cell"
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                aria-label={`Digit ${index + 1}`}
                autoFocus={index === 0}
              />
              {index === 2 && <span className="otp-separator">•</span>}
            </div>
          ))}
        </div>

        <div className="resend-row">
          <span>I didn&apos;t receive a code?</span>
          {seconds > 0 ? (
            <span className="resend-timer">(00:{String(seconds).padStart(2, '0')})</span>
          ) : (
            <button type="button" className="link-button" onClick={resend} disabled={loading}>
              Resend code
            </button>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        {notice && <p className="form-notice">{notice}</p>}

        <button type="button" className="demo-hint" onClick={() => setDigits('123456'.split(''))}>
          Demo OTP <strong>123456</strong>
        </button>

        <div className="auth-bottom">
          <button className="primary-button" type="submit" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </div>
      </form>

      <Keypad onDigit={addDigit} onBackspace={removeDigit} />
    </main>
  );
}
