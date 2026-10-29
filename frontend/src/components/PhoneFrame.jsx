import { StatusBar } from './StatusBar.jsx';

export function PhoneFrame({ children }) {
  return (
    <div className="app-stage">
      <div className="stage-orb stage-orb-a" aria-hidden="true" />
      <div className="stage-orb stage-orb-b" aria-hidden="true" />
      <div className="phone-shell">
        <StatusBar />
        {children}
      </div>
    </div>
  );
}
