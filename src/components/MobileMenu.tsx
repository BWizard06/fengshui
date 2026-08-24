import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MenuItem {
  label: string;
  href: string;
  active: boolean;
}

interface Props {
  items: MenuItem[];
  logoSrc: string;
  logoAlt: string;
  ctaHref: string;
  labels: {
    open: string;
    close: string;
    cta: string;
    tagline: string;
  };
}

export default function MobileMenu({ items, logoSrc, logoAlt, ctaHref, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
    <div className="desk:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.open}
        aria-expanded={open}
        className="flex h-11 w-11 flex-col items-end justify-center gap-[5px] pr-0.5"
      >
        <span className="block h-[1.5px] w-6 rounded-[1px] bg-taupe" />
        <span className="block h-[1.5px] w-[18px] rounded-[1px] bg-taupe" />
        <span className="block h-[1.5px] w-6 rounded-[1px] bg-taupe" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex animate-menu-in flex-col bg-cream/[0.985] px-[26px] pt-11 pb-[34px] backdrop-blur-[14px]"
            role="dialog"
            aria-modal="true"
            aria-label={labels.open}
          >
            <div className="flex items-center justify-between pt-1.5">
              <img src={logoSrc} alt={logoAlt} className="h-[54px] w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className="flex h-11 w-11 items-center justify-center text-[30px] leading-none font-extralight text-mute transition-colors hover:text-taupe"
              >
                ×
              </button>
            </div>

            <nav className="mt-[26px] flex flex-col gap-0.5">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.active ? 'page' : undefined}
                  className="flex items-center justify-between border-b border-line/50 px-0.5 py-[15px] no-underline"
                >
                  <span
                    className={`font-serif text-[1.6875rem] font-medium ${
                      item.active ? 'text-taupe' : 'text-mute'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className={`text-base ${item.active ? 'text-blush' : 'text-transparent'}`}>
                    →
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-auto pt-8 text-center">
              <a
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="block rounded-full bg-sage px-5 py-4 text-[0.71875rem] font-medium tracking-[0.125rem] text-cream uppercase no-underline transition-colors hover:bg-sage-deep hover:text-cream"
              >
                {labels.cta}
              </a>
              <p className="mt-4 font-script text-[1.625rem] text-rose">{labels.tagline}</p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
