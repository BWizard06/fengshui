import { useEffect, useRef, useState, type FormEvent } from 'react';
import FormField from './FormField';

interface Props {
  labels: {
    name: string;
    email: string;
    message: string;
    newsletter: string;
    newsletterHint: string;
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
  fieldErrors: {
    name: string;
    email: string;
    message: string;
  };
  privacy: {
    text: string;
    linkLabel: string;
    href: string;
  };
}

type Status = 'idle' | 'sending' | 'done' | 'failed';
type FieldName = 'name' | 'email' | 'message';

export default function ContactForm({ labels, errors, fieldErrors, privacy }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<keyof Props['errors'] | null>(null);
  const [invalid, setInvalid] = useState<FieldName[]>([]);
  const startedAt = useRef(Date.now());
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'done') successRef.current?.focus();
  }, [status]);

  const errorFor = (field: FieldName) => (invalid.includes(field) ? fieldErrors[field] : undefined);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setErrorKey(null);
    setInvalid([]);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          newsletter,
          website,
          startedAt: startedAt.current,
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: keyof Props['errors'];
        fields?: FieldName[];
      };

      if (result.ok) {
        setStatus('done');
        return;
      }

      setStatus('failed');
      setErrorKey(result.error ?? 'server');
      setInvalid(result.fields ?? []);
    } catch {
      setStatus('failed');
      setErrorKey('network');
    }
  };

  if (status === 'done') {
    return (
      <div ref={successRef} tabIndex={-1} className="py-6 text-center desk:py-10">
        <span className="mx-auto mb-5 rule-line" />
        <p className="mb-2.5 font-serif text-serif-lg font-semibold text-taupe">
          {labels.successTitle}
        </p>
        <p className="text-body-sm font-light text-mute">{labels.successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 desk:gap-[18px]">
      <FormField id="contact-name" label={labels.name} error={errorFor('name')}>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={invalid.includes('name')}
          className="field-input"
        />
      </FormField>

      <FormField id="contact-email" label={labels.email} error={errorFor('email')}>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={invalid.includes('email')}
          className="field-input"
        />
      </FormField>

      <FormField id="contact-message" label={labels.message} error={errorFor('message')}>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={invalid.includes('message')}
          className="min-h-[117px] field-input resize-y desk:min-h-[134px]"
        />
      </FormField>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 pt-0.5">
        <input
          type="checkbox"
          checked={newsletter}
          onChange={(event) => setNewsletter(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`mt-px flex size-[18px] flex-none items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose ${
            newsletter ? 'border-sage bg-sage' : 'border-blush/60 bg-cream'
          }`}
        >
          {newsletter && (
            <svg viewBox="0 0 12 10" className="size-2.5" aria-hidden="true">
              <path
                d="M1 5.2 4.3 8.5 11 1.5"
                fill="none"
                stroke="#FBF6F2"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-[0.8125rem] leading-[1.55] font-light text-taupe">
          {labels.newsletter}
          <span className="mt-0.5 block text-[0.71875rem] text-mute">{labels.newsletterHint}</span>
        </span>
      </label>

      <p className="text-[0.71875rem] leading-[1.6] font-light text-mute">
        {privacy.text}{' '}
        <a href={privacy.href} className="text-mute">
          {privacy.linkLabel}
        </a>
        .
      </p>

      {errorKey && (
        <p role="alert" className="text-[0.78125rem] leading-[1.7] font-light text-caution">
          {errors[errorKey]}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-full bg-sage px-5 py-4 text-center text-[0.71875rem] font-medium tracking-[0.125rem] text-cream uppercase transition-colors hover:bg-sage-deep disabled:cursor-progress disabled:opacity-70 desk:px-[30px] desk:py-[15px] desk:text-xs"
      >
        {status === 'sending' ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
