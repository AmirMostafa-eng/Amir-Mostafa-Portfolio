"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type ContactValues = { name: string; email: string; message: string; website: string };
type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const initialValues: ContactValues = { name: "", email: "", message: "", website: "" };

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.message.trim()) errors.message = "Please add a message.";
  return errors;
}

export function Contact() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function update(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "idle") setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("The message could not be sent.");
      setStatus("success");
      setValues(initialValues);
    } catch {
      setStatus("error");
    }
  }

  const statusMessage = status === "success"
    ? "Thanks for reaching out. Your message has been received."
    : status === "error"
      ? "Something went wrong. Please try again or email me directly."
      : "";

  return (
    <section className="section contact-section" id="contact" aria-labelledby="contact-title">
      <Container>
        <SectionHeading title="Get in touch" description={site.contactIntro} id="contact-title" />
        <div className="contact-grid">
          <div className="contact-info">
            <a className="contact-email" href={`mailto:${site.email}`}>{site.email}</a>
            <div className="contact-socials" aria-label="Social profiles">
              <Link className="icon-link" href={site.socials.github} aria-label="GitHub"><FiGithub aria-hidden="true" /></Link>
              <Link className="icon-link" href={site.socials.linkedin} aria-label="LinkedIn"><FiLinkedin aria-hidden="true" /></Link>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" name="name" autoComplete="name" value={values.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} />
              {errors.name ? <p className="field-error" id="contact-name-error">{errors.name}</p> : null}
            </div>
            <div className="form-field">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} />
              {errors.email ? <p className="field-error" id="contact-email-error">{errors.email}</p> : null}
            </div>
            <div className="form-field">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" name="message" value={values.message} onChange={(event) => update("message", event.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : undefined} />
              {errors.message ? <p className="field-error" id="contact-message-error">{errors.message}</p> : null}
            </div>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Leave this field empty</label>
              <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} />
            </div>
            <div>
              <Button type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending…" : "Send message"}</Button>
              {statusMessage ? <p className="form-status" data-kind={status} role="status" aria-live="polite">{statusMessage}</p> : null}
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
