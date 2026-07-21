import AboutLogoShuffle from "@/components/AboutLogoShuffle";
import trustContent from "../../content/pages/about-trust.json";

type Testimonial = {
  author: string;
  role?: string;
  quote: string;
  linkedin?: string;
};

export default function AboutTrust() {
  const logos = trustContent.client_logos.filter(
    (logo) => !logo.src.includes("BAT-logo")
  );
  const perView = trustContent.logos_per_view ?? 12;
  const testimonials = (trustContent.testimonials as Testimonial[]).filter(
    (item) => item.author && item.quote.length > 60
  );

  if (logos.length === 0 && testimonials.length === 0) return null;

  return (
    <section className="about-trust" aria-label="Client proof">
      {logos.length > 0 && (
        <AboutLogoShuffle
          logos={logos}
          perView={perView}
          heading={trustContent.logos_heading}
        />
      )}

      {testimonials.length > 0 && (
        <div className="about-trust-quotes">
          <h2 className="about-trust-heading">
            {trustContent.testimonials_heading}
          </h2>
          <ul className="about-testimonial-grid">
            {testimonials.map((item) => (
              <li key={item.author} className="about-testimonial-item">
                <figure className="about-testimonial-card">
                  <blockquote className="about-testimonial-quote">
                    <p>{item.quote}</p>
                  </blockquote>
                  <figcaption className="about-testimonial-footer">
                    {item.linkedin ? (
                      <a
                        href={item.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-testimonial-name"
                      >
                        {item.author}
                      </a>
                    ) : (
                      <span className="about-testimonial-name">{item.author}</span>
                    )}
                    {item.role ? (
                      <span className="about-testimonial-role">{item.role}</span>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
