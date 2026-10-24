import Link from "next/link";

import { TeamMemberAvatar } from "@/components/team-member-avatar";
import { TeamMemberSocialLinks } from "@/components/team-member-social-links";
import { teamMembers } from "@/lib/team-members";
import { BRAND_SHORT } from "@/lib/brand";
import type { TeamMember } from "@/lib/team-members";

type TeamStripContent = {
  heading?: string;
  body?: string;
  members?: readonly TeamMember[];
};

export function TeamStripSection({ content }: { content?: TeamStripContent }) {
  const heading = content?.heading ?? "Engineers you will work with";
  const body =
    content?.body ??
    `${BRAND_SHORT} is a small, senior-led team — no hand-offs to anonymous contractors.`;
  const members = content?.members ?? teamMembers;

  return (
    <section
      aria-labelledby="team-strip-heading"
      className="border-b border-border bg-background px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-xl sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-xone-violet">
            Team
          </p>
          <h2
            id="team-strip-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {body}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {members.map((member) => (
            <li
              key={member.name}
              className="flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center motion-safe:transition-shadow motion-safe:hover:shadow-sm sm:items-start sm:text-left"
            >
              <TeamMemberAvatar
                initials={member.initials}
                name={member.name}
                photoSrc={member.photoSrc}
                size="lg"
              />
              <h3 className="mt-5 text-base font-semibold text-foreground sm:text-lg">
                {member.name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {member.role}
              </p>
              <TeamMemberSocialLinks member={member} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-muted-foreground sm:text-left">
          <Link
            href="/about"
            className="font-medium text-xone-violet hover:underline"
          >
            Learn more about {BRAND_SHORT}
          </Link>
        </p>
      </div>
    </section>
  );
}
