// Style
import "./AccountPage.css";
// Contexts & Hooks
import { useAuth } from "@/contexts";
import { useNameForm, usePasswordForm } from "@/hooks";
// Components
import { PasswordForm } from "@/components";
import { NameForm } from "./_components";
// Utils
import { ROLE_LABEL } from "@/lib";

export default function AccountPage() {
  const { profile } = useAuth();
  const nameForm = useNameForm();
  const passwordForm = usePasswordForm();

  if (!profile) return null;

  return (
    <div className="account-page">
      <h1>Account</h1>
      <p className="muted">
        {profile.email} ({ROLE_LABEL[profile.role]})
      </p>

      <h2>Display name</h2>
      <p className="muted">
        Shown as the default byline on articles you write.
      </p>
      <NameForm {...nameForm} />

      <h2>Change password</h2>
      <PasswordForm {...passwordForm} submitLabel="Update password" />
    </div>
  );
}
