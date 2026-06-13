import { contactLinks } from "@/lib/contact";

export default function ContactLinks() {
  return (
    <div className="contact-info reveal" style={{ minWidth: 220 }}>
      <h3 style={{ marginBottom: 16 }}>Find me on</h3>
      <p className="text-small">
        Or reach out directly through the channels below.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        {contactLinks.map(({ href, label, icon }) => (
          <a
            key={href}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="contact-link"
          >
            <span className="contact-icon">{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
