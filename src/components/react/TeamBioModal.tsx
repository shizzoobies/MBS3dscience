import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

/**
 * Team bio modal — Radix Dialog with proper focus trap, scroll lock, ESC,
 * portal rendering. Mounts once at the end of the page and listens for the
 * `mbs-open-bio` custom event dispatched by the team-avatar buttons in
 * about.astro. This replaces the hand-rolled modal whose state-bleed bug
 * (the Bradenton link leaking across members) we patched reactively.
 */

type TeamMember = {
  name: string;
  role: string;
  credentials?: string;
  image: string;
  avatarPosition?: string;
  chipLabel: string;
  chipClass: string;
  shortBio?: string;
  fullBio: string[];
  tags: string[];
  link?: { label: string; href: string; sub?: string };
};

export default function TeamBioModal() {
  const [member, setMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<TeamMember>).detail;
      if (detail) setMember(detail);
    };
    window.addEventListener('mbs-open-bio', handler);
    return () => window.removeEventListener('mbs-open-bio', handler);
  }, []);

  const open = !!member;

  return (
    <Dialog.Root open={open} onOpenChange={o => !o && setMember(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="member-modal__backdrop member-modal__backdrop--radix" />
        <Dialog.Content
          className="member-modal__dialog member-modal__dialog--radix"
          aria-describedby={undefined}
        >
          {member && (
            <>
              <Dialog.Close asChild>
                <button type="button" className="member-modal__close" aria-label="Close bio">
                  &times;
                </button>
              </Dialog.Close>

              <div className="member-modal__header">
                <div className="member-modal__photo">
                  <img
                    src={member.image}
                    alt={member.name}
                    style={
                      member.avatarPosition
                        ? { objectPosition: member.avatarPosition }
                        : undefined
                    }
                  />
                </div>
                <div>
                  <span className={`accent-chip ${member.chipClass}`}>{member.chipLabel}</span>
                  <Dialog.Title style={{ marginTop: '0.75rem' }} asChild>
                    <h2>{member.name}</h2>
                  </Dialog.Title>
                  <p className="member-modal__role">{member.role}</p>
                  {member.credentials && (
                    <p className="member-modal__creds">{member.credentials}</p>
                  )}
                </div>
              </div>

              <div className="member-modal__bio">
                {member.fullBio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {member.link && member.link.href && member.link.label && (
                <p className="member-modal__link-wrap is-shown">
                  <a
                    className="member-modal__link"
                    href={member.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="member-modal__link-label">{member.link.label}</span>
                    <svg
                      className="member-modal__link-arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </a>
                </p>
              )}

              {member.tags && member.tags.length > 0 && (
                <div className="member-modal__tags">
                  {member.tags.map(t => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
