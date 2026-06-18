import FaIcon from '../FaIcon';

export default function DoctorSelectCards({
  doctors,
  selectedId,
  onSelect,
  disabled = false,
  accent = 'primary',
  emptyMessage = 'No doctors found in your area.',
}) {
  const isOrange = accent === 'orange';
  const selectedRing = isOrange ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-primary-500 bg-primary-50 ring-2 ring-primary-200';
  const hoverBorder = isOrange ? 'hover:border-orange-200' : 'hover:border-primary-200';
  const checkColor = isOrange ? 'text-orange-600' : 'text-primary-600';

  if (!doctors.length) {
    return <p className="text-sm text-slate-500 py-4 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2 max-h-[min(420px,55vh)] overflow-y-auto overscroll-contain pr-1 -mr-1">
      {doctors.map((d) => {
        const selected = String(selectedId) === String(d.id);
        return (
          <button
            key={d.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(String(d.id), d)}
            className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              selected ? selectedRing : `border-slate-200 bg-white/80 ${hoverBorder}`
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {d.first_name?.[0]}
              {d.last_name?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">
                Dr. {d.first_name} {d.last_name}
              </p>
              <p className="text-xs text-slate-500 truncate">{d.specialization || 'Physiotherapist'}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {d.city_name && (
                  <span className="text-[11px] text-slate-400 inline-flex items-center gap-0.5">
                    <FaIcon icon="fa-location-dot" />
                    {d.city_name}
                  </span>
                )}
                {d.distance_km != null && (
                  <span className="text-[11px] text-slate-400">{d.distance_km} km away</span>
                )}
                {Number(d.rating_avg) > 0 && (
                  <span className="text-[11px] text-amber-600">
                    <FaIcon icon="fa-star" className="mr-0.5" />
                    {Number(d.rating_avg).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            {selected && <FaIcon icon="fa-circle-check" className={`${checkColor} text-lg shrink-0`} />}
          </button>
        );
      })}
    </div>
  );
}
