import { useRef, useState, type FormEvent } from 'react';

interface Props {
  labels: {
    label: string;
    placeholder: string;
    submit: string;
    sending: string;
    successTitle: string;
    successText: string;
  };
  errors: {
    validation: string;
    rateLimit: string;
    notConfigured: string;
    server: string;
    network: string;
  };
  fieldError: string;
  privacy: {
    text: string;
    linkLabel: string;
    href: string;
  };
}

type Status = 'idle' | 'sending' | 'done' | 'failed';

export default function NewsletterForm({ labels, errors, fieldError, privacy }: Props) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<keyof Props['errors'] | null>(null);
  const [invalid, setInvalid] = useState(false);
  const startedAt = useRef(Date.now());

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setErrorKey(null);
    setInvalid(false);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, website, startedAt: startedAt.current }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: keyof Props['errors'];
        fields?: string[];
      };

      if (result.ok) {
        setStatus('done');
        return;
      }

      setStatus('failed');
      setErrorKey(result.error ?? 'server');
      setInvalid((result.fields ?? []).includes('email'));
    } catch {
      setStatus('failed');
      setErrorKey('network');
    }
  };

  if (status === 'done') {
    return (
      <div className="text-center">
        <p className="mb-1.5 font-serif text-serif-md font-semibold text-taupe">
          {labels.successTitle}
        </p>
        <p className="text-body-sm font-light text-mute">{labels.successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        {labels.label}
      </label>
      <div className="flex flex-col gap-3">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={labels.placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={invalid}
          className="field-input"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-full bg-sage px-5 py-4 text-center text-[0.71875rem] font-medium tracking-[0.125rem] text-cream uppercase transition-colors hover:bg-sage-deep disabled:cursor-progress disabled:opacity-70 desk:px-[30px] desk:py-[15px] desk:text-xs"
        >
          {status === 'sending' ? labels.sending : labels.submit}
        </button>
      </div>

      <p className="mt-3 text-center text-[0.6875rem] leading-[1.6] font-light text-mute">
        {privacy.text}{' '}
        <a href={privacy.href} className="text-mute">
          {privacy.linkLabel}
        </a>
        .
      </p>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">Website</label>
        <input
          id="newsletter-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {(invalid || errorKey) && (
        <p role="alert" className="mt-2.5 text-[0.78125rem] leading-[1.7] font-light text-caution">
          {invalid ? fieldError : errors[errorKey ?? 'server']}
        </p>
      )}
    </form>
  );
}
