import { Link } from "react-router-dom";
// Style
import "./DashboardPage.css";
// Hooks
import { useDashboard } from "@/hooks";
// Components
import { PageHeader } from "@/components";
import { CountsTable, DashboardSectionBlock } from "./_components";
// Utils
import { can } from "@/lib";

export default function DashboardPage() {
  const { profile, counts, sections } = useDashboard();

  if (!profile) return null;

  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard">
        {can.writeArticles(profile.role) && (
          <Link className="btn btn--primary" to="/articles/new">
            Write a new article
          </Link>
        )}
      </PageHeader>

      <CountsTable counts={counts.data} failed={Boolean(counts.error)} />

      {sections.map((section) => (
        <DashboardSectionBlock key={section.status} {...section} />
      ))}
    </div>
  );
}
