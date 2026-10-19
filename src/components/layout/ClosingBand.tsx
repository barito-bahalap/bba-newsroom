// Style
import "./ClosingBand.css";
// Components
import { Button, IndexLabel } from "@/components";

interface ClosingBandProps {
  heading: string;
  body: string;
  cta: { label: string; href: string };
  index?: number;
  label?: string;
  contact?: { label: string; value: string };
}

export function ClosingBand({
  heading,
  body,
  cta,
  index,
  label,
  contact,
}: ClosingBandProps) {
  return (
    <section className="closing vt-tone vt-tone--navy">
      <div className="vt-wrap closing__inner">
        <div className="closing__lead">
          {index !== undefined && label && (
            <IndexLabel index={index} label={label} />
          )}
          <h2 className="closing__title">{heading}</h2>
        </div>

        <div className="closing__side">
          <p className="closing__body">{body}</p>
          <div className="closing__actions">
            <Button href={cta.href} variant="accent" brand="media">
              {cta.label}
            </Button>
          </div>
          {contact && (
            <p className="closing__contact">
              <span>{contact.label}</span>
              <a href={`mailto:${contact.value}`}>{contact.value}</a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
