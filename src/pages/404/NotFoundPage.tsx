import { Link } from "react-router-dom";
// Style
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to dashboard</Link>
      </p>
    </div>
  );
}
