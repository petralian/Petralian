import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nathan Petralia — enterprise AI and digital transformation leader. Twenty years inside APAC's most demanding transformation programs. Now advising, writing, and building.",
};

export default function AboutPage() {
  return (
    <div className="prose-container">
      <header className="about-header">
        <h1 className="about-title">Nathan Petralia</h1>
        <p className="about-subtitle">
          Enterprise AI and digital transformation leader. Practitioner, not pundit.
        </p>
      </header>

      <div className="prose prose-lg max-w-none">
        <p>
          There are people who write about enterprise transformation from a distance.
          I&apos;m not one of them.
        </p>
        <p>
          I&apos;ve spent twenty years inside it — as a practitioner, a commercial
          leader, and sometimes the person who had to explain to a board why a
          well-funded program was being scoped back. I&apos;ve been on the client
          side and the agency side. I&apos;ve built practices from scratch and
          inherited ones that needed fixing. I&apos;ve sold work and delivered it.
          Those two roles are not as separate as most people in this industry pretend.
        </p>
        <p>
          My career has moved through Estée Lauder, Shiseido, Microsoft, Merkle,
          and Ogilvy — among others. I spent six years at Merkle Hong Kong, eventually
          as Managing Director, building their CXM practice across APAC within the
          Dentsu network. Before that, Isobar Commerce. I&apos;ve led digital commerce
          transformations for luxury, retail, and financial services brands, and spent
          a significant amount of time working out why well-resourced technology
          programs produce disappointing results.
        </p>
        <p>
          In 2024, I started building my own software — Vouch and Gravio — using AI
          as the primary engineer. Not as a side project. As a serious attempt to
          understand what it actually means to direct a complex build when AI is doing
          the work. What I learned changed how I think about enterprise AI programs,
          and most of it isn&apos;t in the conversations I see about tooling.
        </p>

        <h2>What I&apos;m known for</h2>
        <p>
          People who&apos;ve worked with me tend to come back to the same things.
        </p>
        <p>
          I know how to sell — not in a transactional sense, but in the sense of
          building a commercial case that holds, creating propositions that address
          a real business problem, and taking a deal from concept to signature
          without needing the org chart to carry it. I&apos;ve built GTM strategies
          and business development functions, and I understand the difference between
          a prospect who is interested and one who is ready to move.
        </p>
        <p>
          I build and look after practitioners. The teams I&apos;ve led produce
          strong work and stay — not because the culture is performative, but because
          people feel genuinely developed and trusted with real responsibility.
        </p>
        <p>
          I deliver. Within margin. Against real metrics. Whether the program is a
          six-week sprint or a multi-year transformation, I treat accountability as
          a first principle, not a reporting format.
        </p>
        <p>
          I can hold the commercial conversation, the solutions conversation, and the
          technology conversation in the same room without switching registers. In AI
          specifically — I&apos;m not just fluent in the strategy. I&apos;ve built
          the thing.
        </p>

        <h2>Why I write</h2>
        <p>
          Because the real conversation about enterprise AI and digital transformation
          happens at the level where strategy meets delivery — and that level is
          underrepresented in public discourse. Most writing on AI is either too
          abstract (strategy without operations) or too technical (tools without
          business context). I try to write for the people who sit in the middle:
          senior practitioners, delivery leaders, and decision-makers who need to act,
          not just think.
        </p>

        <h2>Currently</h2>
        <p>
          Advising organisations on enterprise AI and digital transformation strategy.
          Writing here. Building things that didn&apos;t exist before.
        </p>

        <h2>Get in touch</h2>
        <p>
          The best way to reach me is{" "}
          <a href="mailto:nathan@petralian.com">email</a> or{" "}
          <a
            href="https://www.linkedin.com/in/petralian/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          . I&apos;m always happy to think out loud.
        </p>
      </div>
    </div>
  );
}
