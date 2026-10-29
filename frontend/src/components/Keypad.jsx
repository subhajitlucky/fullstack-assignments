import { Backspace } from './Icons.jsx';

const keys = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
];

export function Keypad({ onDigit, onBackspace }) {
  return (
    <div className="keypad" aria-label="Numeric keypad">
      {keys.map((key) => (
        <button
          key={key.digit}
          type="button"
          className="key"
          onClick={() => onDigit(key.digit)}
        >
          <span className="key-digit">{key.digit}</span>
          <span className="key-letters">{key.letters}</span>
        </button>
      ))}
      <span className="key-spacer" aria-hidden="true" />
      <button type="button" className="key" onClick={() => onDigit('0')}>
        <span className="key-digit">0</span>
      </button>
      <button type="button" className="key key-back" onClick={onBackspace} aria-label="Delete digit">
        <Backspace size={22} />
      </button>
    </div>
  );
}
