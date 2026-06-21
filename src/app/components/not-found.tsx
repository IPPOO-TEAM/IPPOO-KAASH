import { NavLink } from "react-router";
import { EmptyState, NoResultsIllustration } from "./illustrations";
import { usePageTitle } from "../utils/use-page-title";
import { useT } from "../i18n/language-context";

export function NotFoundPage() {
  const t = useT();
  usePageTitle(t("notFound.title"));
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <EmptyState
        illustration={<NoResultsIllustration size={180} />}
        title={t("notFound.title")}
        subtitle={t("notFound.subtitle")}
        action={
          <NavLink
            to="/"
            className="px-5 h-11 inline-flex items-center rounded-2xl bg-[#14B85A] text-white text-[13px]"
            style={{ fontWeight: 600, boxShadow: "0 8px 20px rgba(20,184,90,0.25)" }}
          >
            {t("notFound.home")}
          </NavLink>
        }
      />
    </div>
  );
}
