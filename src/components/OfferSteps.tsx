import { useState } from 'react';

interface Step {
  number: string;
  title: string;
  text: string;
}

interface Props {
  steps: readonly Step[];
}

export default function OfferSteps({ steps }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3 desk:gap-3.5">
      {steps.map((step, index) => {
        const open = openIndex === index;
        const panelId = `offer-step-${index}`;
        return (
          <div
            key={step.number}
            style={{ borderColor: open ? 'var(--color-blush)' : 'rgb(220 207 195 / 0.55)' }}
            className="overflow-hidden rounded-2xl border bg-white transition-colors duration-200"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              aria-controls={panelId}
              className="flex w-full items-center gap-3.5 px-[18px] py-4 text-left transition-colors hover:bg-cream desk:gap-5 desk:px-7 desk:py-[22px]"
            >
              <span className="w-[22px] flex-none font-serif text-[1.625rem] leading-none font-medium text-blush desk:w-9 desk:text-[2rem]">
                {step.number}
              </span>
              <span className="flex-1 font-serif text-serif-md font-semibold text-taupe">
                {step.title}
              </span>
              <span className="flex-none text-2xl leading-none font-light text-rose desk:text-[1.625rem]">
                {open ? '–' : '+'}
              </span>
            </button>
            {open && (
              <p
                id={panelId}
                className="px-[18px] pt-0 pb-5 pl-[54px] text-body-sm font-light desk:px-8 desk:pb-[26px] desk:pl-21"
              >
                {step.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
