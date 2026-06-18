import FaIcon from '../FaIcon';

export default function BookingStepProgress({ steps, currentStep, accent = 'primary' }) {
  const fillClass = accent === 'orange'
    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
    : 'bg-gradient-to-r from-primary-500 to-primary-600';
  const activeClass = accent === 'orange' ? 'bg-orange-600 text-white' : 'bg-primary-600 text-white';
  const doneClass = accent === 'orange' ? 'bg-orange-100 text-orange-800' : 'bg-primary-100 text-primary-800';
  const labelActive = accent === 'orange' ? 'text-orange-700' : 'text-primary-700';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1 sm:gap-2 mb-3">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                i < currentStep ? doneClass : i === currentStep ? activeClass : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i < currentStep ? <FaIcon icon="fa-check" /> : i + 1}
            </div>
            <span
              className={`text-[9px] sm:text-[11px] font-medium truncate w-full text-center ${
                i <= currentStep ? labelActive : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${fillClass}`}
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
