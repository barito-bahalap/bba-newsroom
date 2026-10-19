import { Link } from "react-router-dom";
import ArticleTable from "@/components/module/ArticleTable";
import { useArticleCounts, useArticlesByStatus } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { STATUS_LABEL } from "@/lib/format";
import { can } from "@/lib/permissions";
import type { ArticleStatus, Role } from "@/lib/types";

const STATUSES: ArticleStatus[] = [
  "draft",
  "in_review",
  "published",
  "unpublished",
];

interface SectionSpec {
  title: string;
  status: ArticleStatus;
}

function sectionsFor(role: Role): SectionSpec[] {
  const review = { title: "Waiting for review", status: "in_review" as const };
  const drafts = { title: "Drafts", status: "draft" as const };
  const published = {
    title: "Recently published",
    status: "published" as const,
  };
  if (role === "admin") return [published, review];
  if (role === "publisher") return [review, drafts, published];
  return [review, drafts];
}

function Section({ title, status }: SectionSpec) {
  const query = useArticlesByStatus(status);
  return (
    <section>
      <h2>{title}</h2>
      {query.isLoading && <p className="muted">Loading...</p>}
      {query.error && <p className="error">Could not load articles.</p>}
      {query.data && <ArticleTable rows={query.data} />}
      <p>
        <Link to={`/articles?status=${status}`}>See all</Link>
      </p>
    </section>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const counts = useArticleCounts();

  if (!profile) return null;

  return (
    <div>
      <h1>DashboardPage</h1>
      <div className="row">
        {can.writeArticles(profile.role) && (
          <Link className="button" to="/articles/new">
            Write a new article
          </Link>
        )}
      </div>

      <section>
        <h2>Overview</h2>
        {counts.error && <p className="error">Could not load counts.</p>}
        <table className="compact">
          <tbody>
            {STATUSES.map((status) => (
              <tr key={status}>
                <td>
                  <Link to={`/articles?status=${status}`}>
                    {STATUS_LABEL[status]}
                  </Link>
                </td>
                <td>{counts.data ? counts.data[status] : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {sectionsFor(profile.role).map((spec) => (
        <Section key={spec.status} {...spec} />
      ))}
    </div>
  );
}
