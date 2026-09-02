export function Art({ type, tint }: { type: string; tint: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      {type === 'laptop' && (
        <g>
          <rect x="46" y="44" width="108" height="70" rx="6" fill="#3f3f46" />
          <rect x="52" y="50" width="96" height="58" rx="3" fill={tint} />
          <path d="M34 118h132l10 22a4 4 0 0 1-4 6H28a4 4 0 0 1-4-6z" fill="#52525b" />
        </g>
      )}
      {type === 'pc' && (
        <g>
          <rect x="48" y="24" width="104" height="152" rx="8" fill="#1c1917" stroke="#3f3f46" strokeWidth="3" />
          <rect x="56" y="32" width="76" height="136" rx="4" fill="#09090b" />
          <circle cx="94" cy="62" r="22" fill="none" stroke={tint} strokeWidth="4" />
          <circle cx="94" cy="62" r="7" fill={tint} />
          <circle cx="94" cy="118" r="22" fill="none" stroke={tint} strokeWidth="4" />
          <circle cx="94" cy="118" r="7" fill={tint} />
          <circle cx="140" cy="38" r="3" fill="#22c55e" />
          <rect x="138" y="46" width="4" height="8" rx="1" fill="#71717a" />
          <rect x="138" y="58" width="4" height="8" rx="1" fill="#71717a" />
        </g>
      )}
      {type === 'component' && (
        <g>
          <rect x="24" y="56" width="152" height="86" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="2.5" />
          <rect x="18" y="48" width="8" height="104" rx="2" fill="#71717a" />
          <circle cx="68" cy="98" r="24" fill="#27272a" stroke={tint} strokeWidth="3" />
          <circle cx="68" cy="98" r="8" fill={tint} />
          <circle cx="130" cy="98" r="24" fill="#27272a" stroke={tint} strokeWidth="3" />
          <circle cx="130" cy="98" r="8" fill={tint} />
          <rect x="50" y="142" width="90" height="8" rx="1" fill="#eab308" />
        </g>
      )}
      {type === 'monitor' && (
        <g>
          <rect x="30" y="38" width="140" height="90" rx="7" fill="#292524" />
          <rect x="37" y="45" width="126" height="72" rx="3" fill={tint} />
          <rect x="92" y="128" width="16" height="18" fill="#44403c" />
          <rect x="66" y="146" width="68" height="8" rx="4" fill="#44403c" />
        </g>
      )}
      {type === 'mouse' && (
        <g>
          <ellipse cx="100" cy="102" rx="34" ry="50" fill={tint} stroke="#3f3f46" strokeWidth="3" />
          <path d="M100 52v38" stroke="#3f3f46" strokeWidth="2.5" />
        </g>
      )}
      {type === 'keyboard' && (
        <g>
          <rect x="24" y="62" width="152" height="76" rx="9" fill="#44403c" />
          <rect x="30" y="68" width="140" height="64" rx="6" fill="#292524" />
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 12 }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={36 + c * 11}
                y={74 + r * 15}
                width="8"
                height="11"
                rx="2"
                fill={r === 1 && c % 3 === 0 ? tint : '#78716c'}
              />
            ))
          )}
        </g>
      )}
      {type === 'headphone' && (
        <g>
          <path d="M60 105V88a40 40 0 0 1 80 0v17" fill="none" stroke="#3f3f46" strokeWidth="9" strokeLinecap="round" />
          <rect x="42" y="100" width="26" height="46" rx="11" fill={tint} stroke="#3f3f46" strokeWidth="3" />
          <rect x="132" y="100" width="26" height="46" rx="11" fill={tint} stroke="#3f3f46" strokeWidth="3" />
        </g>
      )}
      {type === 'speaker' && (
        <g>
          <rect x="58" y="40" width="84" height="122" rx="14" fill="#292524" />
          <circle cx="100" cy="76" r="18" fill={tint} />
          <circle cx="100" cy="126" r="26" fill="#44403c" />
        </g>
      )}
      {type === 'earbuds' && (
        <g>
          <rect x="56" y="86" width="88" height="52" rx="14" fill={tint} stroke="#3f3f46" strokeWidth="3" />
          <circle cx="74" cy="60" r="14" fill="#fafafa" stroke="#3f3f46" strokeWidth="3" />
          <circle cx="126" cy="60" r="14" fill="#fafafa" stroke="#3f3f46" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}

