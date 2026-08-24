import { useEffect, useState } from 'react';

interface Area {
  key: string;
  direction: string;
  name: string;
  element: string;
  colors: string;
  support: string;
  themes: string;
  accent: string;
  iconSrc: string;
}

interface Props {
  areas: readonly Area[];
  labels: {
    element: string;
    colors: string;
    support: string;
    themes: string;
    close: string;
  };
}

export default function BaguaExplorer({ areas, labels }: Props) {
  const [selected, setSelected] = useState('taiji');
  const [open, setOpen] = useState(false);

  const detail = areas.find((area) => area.key === selected) ?? areas[0];

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-3 gap-[7px] desk:gap-2.5">
        {areas.map((area) => {
          const active = area.key === selected;
          return (
            <button
              type="button"
              key={area.key}
              onClick={() => {
                setSelected(area.key);
                setOpen(true);
              }}
              aria-haspopup="dialog"
              style={{
                backgroundColor: active ? `${area.accent}1F` : '#FFFFFF',
                borderColor: active ? area.accent : 'rgb(220 207 195 / 0.55)',
              }}
              className="rounded-xl border px-[5px] pt-3.5 pb-3 text-center transition-[background-color,border-color] duration-200 hover:border-blush desk:rounded-[14px] desk:px-3 desk:pt-[22px] desk:pb-[18px]"
            >
              <img
                src={area.iconSrc}
                alt=""
                className="mx-auto mb-1.5 block size-[34px] rounded-full object-cover mix-blend-multiply desk:mb-2.5 desk:size-[50px]"
                loading="lazy"
              />
              <span className="block text-[0.53125rem] font-medium tracking-[0.1rem] text-mute uppercase desk:text-[0.65625rem] desk:tracking-[0.15625rem]">
                {area.direction}
              </span>
              <span
                className="mt-px mb-0.5 block font-serif text-[1.1875rem] font-semibold desk:text-[1.6875rem]"
                style={{ color: area.accent }}
              >
                {area.name}
              </span>
              <span
                className="block text-[0.5625rem] font-medium tracking-[0.0625rem] uppercase desk:text-[0.6875rem] desk:tracking-[0.09375rem]"
                style={{ color: area.accent }}
              >
                {area.element}
              </span>
            </button>
          );
        })}
      </div>

      {open && detail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={detail.name}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-200 flex animate-overlay-in items-end justify-center bg-[rgb(90_75_68/0.5)] backdrop-blur-[4px] desk:items-center desk:p-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ borderTopColor: detail.accent }}
            className="relative max-h-[82svh] w-full animate-sheet-in overflow-y-auto rounded-t-[26px] border-t-[5px] bg-white px-[22px] pt-[26px] pb-[34px] shadow-sheet desk:max-h-[88svh] desk:max-w-[776px] desk:animate-modal-in desk:rounded-[22px] desk:px-12 desk:pt-[46px] desk:pb-11 desk:shadow-modal"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.close}
              title={labels.close}
              className="absolute top-3.5 right-3.5 flex size-[34px] items-center justify-center rounded-full border border-line/55 bg-cream text-xl leading-none font-light text-mute transition-colors hover:bg-[#F3E8E3] hover:text-taupe desk:top-4 desk:right-4 desk:size-9 desk:text-[1.375rem]"
            >
              ×
            </button>

            <div className="mb-5 flex items-center gap-4 desk:mb-[26px] desk:gap-5">
              <img
                src={detail.iconSrc}
                alt=""
                className="size-[58px] flex-none rounded-full object-cover mix-blend-multiply desk:size-[70px]"
              />
              <div>
                <p className="text-[0.59375rem] font-medium tracking-[0.15625rem] text-mute uppercase desk:text-[0.65625rem]">
                  {detail.direction}
                </p>
                <p
                  className="font-serif text-[2.125rem] leading-[1.05] font-semibold desk:text-[2.75rem]"
                  style={{ color: detail.accent }}
                >
                  {detail.name}
                </p>
              </div>
            </div>

            <dl className="mb-[18px] flex flex-col gap-2.5 border-y border-line/55 py-[18px] text-[0.84375rem] font-light text-taupe desk:mb-6 desk:gap-[11px] desk:py-[22px] desk:text-[0.90625rem]">
              {[
                { label: labels.element, value: detail.element, accent: true },
                { label: labels.colors, value: detail.colors, accent: false },
                { label: labels.support, value: detail.support, accent: false },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline gap-3 desk:gap-3.5">
                  <dt className="w-[86px] flex-none text-[0.59375rem] font-medium tracking-[0.1rem] text-sage uppercase desk:w-[104px] desk:text-[0.65625rem] desk:tracking-[0.125rem]">
                    {row.label}
                  </dt>
                  <dd
                    className="m-0"
                    style={row.accent ? { color: detail.accent, fontWeight: 400 } : undefined}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mb-2.5 text-[0.59375rem] font-medium tracking-[0.15625rem] text-sage uppercase desk:mb-3 desk:text-[0.65625rem]">
              {labels.themes}
            </p>
            <p className="font-serif text-[1.1875rem] leading-[1.6] text-taupe italic desk:text-[1.4375rem]">
              {detail.themes}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
