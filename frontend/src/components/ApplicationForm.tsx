import { useState } from "react";
import type { Offer } from "../models/offer.ts";

interface ApplicationFormProps {
  offer: Offer;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (message: string) => Promise<void>;
}

const ApplicationForm = ({
  offer,
  isSubmitting,
  error,
  onCancel,
  onSubmit,
}: ApplicationFormProps) => {
  const [message, setMessage] = useState("");

  return (
    <form
      className="application-form"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(message);
      }}
    >
      <h2>Candidater à « {offer.title} »</h2>
      <label htmlFor={`application-message-${offer.id}`}>
        Message <span>(facultatif)</span>
      </label>
      <textarea
        id={`application-message-${offer.id}`}
        value={message}
        maxLength={500}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
      />
      <p className="field-help">{message.length}/500 caractères</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Envoi…" : "Envoyer ma candidature"}
        </button>
        <button className="button button-secondary" type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
