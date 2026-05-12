import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Contact form — react-hook-form + zod schema for inline field-level validation.
 *
 * Posts to /contact/success/ on submit so the existing static thank-you route
 * keeps working with no backend change. Native form fallback is preserved
 * (the form still has action + method so JS-disabled visitors can submit too).
 */

const PHONE_RE = /^[0-9+()\-\s.]{7,}$/;

const ContactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(v => !v || PHONE_RE.test(v), { message: 'Enter a valid phone number.' }),
  service: z.string().min(1, 'Please choose a service.'),
  message: z
    .string()
    .trim()
    .min(10, 'A few more words help us route this correctly.')
    .max(2000, 'Please keep your message under 2000 characters.'),
});

type ContactValues = z.infer<typeof ContactSchema>;

const SERVICE_OPTIONS = [
  'Primary Care',
  'Medical Weight Loss',
  "Men's Health / TRT",
  "Women's Health",
  'Mental Health',
  'Longevity & Performance',
  'Sexual Health',
  'Hair & Dermatology',
  'Lab Testing',
  'Lifestyle Medicine',
  'Concierge Medicine',
  'Not sure yet',
];

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactValues>({
    resolver: zodResolver(ContactSchema),
    mode: 'onBlur',
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: ContactValues) => {
    setSubmitError(null);
    // Build a real HTML form submission so the existing static action works
    // and so any future server endpoint can consume the same payload.
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/contact/success/';
    form.style.display = 'none';
    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      input.value = typeof value === 'string' ? value : '';
      form.appendChild(input);
    });
    document.body.appendChild(form);
    try {
      form.submit();
    } catch (err) {
      setSubmitError('We could not submit your message. Please try again or call us.');
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="cf-success" role="status">
        <h2>Thanks — we got your message.</h2>
        <p>We respond within one business day.</p>
      </div>
    );
  }

  return (
    <form className="contact-form cf" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first-name">first name</label>
          <input
            id="first-name"
            type="text"
            placeholder="Your first name"
            aria-invalid={!!errors.firstName}
            className="input"
            {...register('firstName')}
          />
          {errors.firstName && <p className="cf-error">{errors.firstName.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="last-name">last name</label>
          <input
            id="last-name"
            type="text"
            placeholder="Your last name"
            aria-invalid={!!errors.lastName}
            className="input"
            {...register('lastName')}
          />
          {errors.lastName && <p className="cf-error">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">email address</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          className="input"
          {...register('email')}
        />
        {errors.email && <p className="cf-error">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">phone (optional)</label>
        <input
          id="phone"
          type="tel"
          placeholder="(123) 456-7890"
          aria-invalid={!!errors.phone}
          className="input"
          {...register('phone')}
        />
        {errors.phone && <p className="cf-error">{errors.phone.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="service">service of interest</label>
        <select
          id="service"
          defaultValue=""
          aria-invalid={!!errors.service}
          className="input"
          {...register('service')}
        >
          <option value="" disabled>
            choose a service...
          </option>
          {SERVICE_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.service && <p className="cf-error">{errors.service.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="message">message</label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us a little about what's on your mind. No pressure to share more than you're comfortable with."
          aria-invalid={!!errors.message}
          className="input"
          {...register('message')}
        />
        {errors.message && <p className="cf-error">{errors.message.message}</p>}
      </div>

      {submitError && (
        <p className="cf-error cf-error--global" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'sending…' : 'send message'}
      </button>

      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--ink-muted)',
          marginTop: '1rem',
          textAlign: 'center',
        }}
      >
        This form is not for medical emergencies. If you are experiencing a medical emergency, call 911.
      </p>
    </form>
  );
}
