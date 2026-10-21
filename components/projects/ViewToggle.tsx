"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiGrid, FiList } from "react-icons/fi";

type View = "grid" | "list";
type ViewToggleProps = { view: View };

export function ViewToggle({ view }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeView(nextView: View) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="view-toggle" aria-label="Project view">
      <button type="button" aria-pressed={view === "grid"} onClick={() => changeView("grid")}>
        <FiGrid aria-hidden="true" /> Grid
      </button>
      <button type="button" aria-pressed={view === "list"} onClick={() => changeView("list")}>
        <FiList aria-hidden="true" /> List
      </button>
    </div>
  );
}
