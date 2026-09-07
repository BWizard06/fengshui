import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TocItem {
  id: string;
  label: string;
}

interface Props {
  items: readonly TocItem[];
  labels: {
    title: string;
    open: string;
    close: string;
  };
}

const HEADER_OFFSET = 140;

export default function TableOfContents({ items, labels }: Props) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const frame = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const update = () => {
      const positions = items
        .map((item) => {
          const el = document.getElementById(item.id);
          return el ? { id: item.id, top: el.getBoundingClientRect().top } : null;
        })
        .filter((entry) => entry !== null);

      if (positions.length === 0) return;

      const passed = positions.filter((entry) => entry.top <= HEADER_OFFSET);
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (atBottom) {
        setActiveId(positions[positions.length - 1].id);
      } else {
        setActiveId(passed.length > 0 ? passed[passed.length - 1].id : positions[0].id);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  useEffect(() => {
    if (!sheetOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [sheetOpen]);

  return (
    <>
      <nav
        aria-label={labels.title}
        className="fixed top-1/2 left-[max(1.5rem,calc(50%-41rem))] z-30 hidden w-[150px] -translate-y-1/2 xl:block"
      >
        <p className="mb-3 eyebrow text-sage">{labels.title}</p>
        <ul className="flex flex-col border-l border-line/55">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id} className="-ml-px">
                <a
                  href={`#${item.id}`}
                  aria-current={active ? 'true' : undefined}
                  className={`block border-l py-[7px] pl-3 text-[0.6875rem] leading-snug no-underline transition-colors duration-300 ${
                    active
                      ? 'border-rose font-medium text-taupe'
                      : 'border-transparent text-mute hover:text-taupe'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        className="fixed right-5 bottom-5 z-40 rounded-full border border-line/55 bg-cream/95 px-[18px] py-3 text-[0.65625rem] font-medium tracking-[0.125rem] text-taupe uppercase shadow-card backdrop-blur-[10px] transition-colors hover:border-blush xl:hidden"
      >
        {labels.title}
      </button>

      {sheetOpen &&
        mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={labels.title}
            onClick={() => setSheetOpen(false)}
            className="fixed inset-0 z-90 flex animate-overlay-in items-end justify-center bg-[rgb(90_75_68/0.5)] backdrop-blur-[4px] desk:items-center desk:p-6"
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[82svh] w-full animate-sheet-in overflow-y-auto rounded-t-[26px] border-t-[5px] border-blush bg-white px-[22px] pt-[26px] pb-[34px] shadow-sheet desk:max-w-[520px] desk:animate-modal-in desk:rounded-[22px] desk:shadow-modal"
            >
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label={labels.close}
                className="absolute top-3.5 right-3.5 flex size-[34px] items-center justify-center rounded-full border border-line/55 bg-cream text-xl leading-none font-light text-mute transition-colors hover:bg-[#F3E8E3] hover:text-taupe"
              >
                ×
              </button>

              <p className="mb-4 eyebrow text-sage">{labels.title}</p>
              <ul className="flex flex-col">
                {items.map((item) => {
                  const active = item.id === activeId;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={() => setSheetOpen(false)}
                        aria-current={active ? 'true' : undefined}
                        className={`flex items-center justify-between border-b border-line/50 py-3.5 font-serif text-serif-sm no-underline ${
                          active ? 'text-taupe' : 'text-mute'
                        }`}
                      >
                        {item.label}
                        <span className={active ? 'text-blush' : 'text-transparent'}>→</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
