import { Drill, Session, SessionDrill } from "@/types/drill";
import { CATEGORY_META } from "@/lib/constants";

interface Props {
  session: Session;
  getDrillById: (id: string) => Drill | undefined;
}

export function SessionPrintSheet({ session, getDrillById }: Props) {
  const totalMinutes = session.drills.reduce((s, d) => s + d.duration, 0);
  const totalRestSec = session.drills.reduce(
    (s, d) => s + (d.restAfter || 0),
    0
  );

  return (
    <div className="print-only print-sheet">
      <header className="print-sheet-header">
        <h1>{session.name}</h1>
        <div className="print-sheet-meta">
          <span>
            {session.drills.length} drill
            {session.drills.length === 1 ? "" : "s"}
          </span>
          <span>
            {totalMinutes} min
            {totalRestSec > 0
              ? ` + ${Math.ceil(totalRestSec / 60)} min rest`
              : ""}
          </span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </header>

      <ol className="print-sheet-list">
        {session.drills.map((sd: SessionDrill, i: number) => {
          const drill = getDrillById(sd.drillId);
          if (!drill) return null;
          const cat = CATEGORY_META[drill.category];
          return (
            <li key={sd.drillId} className="print-sheet-drill">
              <div className="print-sheet-drill-head">
                <span className="print-sheet-num">{i + 1}.</span>
                <span className="print-sheet-title">{drill.title}</span>
                <span className="print-sheet-dur">
                  {sd.duration} min
                  {sd.restAfter
                    ? ` · ${Math.round(sd.restAfter / 60)} min rest after`
                    : ""}
                </span>
              </div>
              <div className="print-sheet-tags">
                <span>{cat.label}</span>
                <span>·</span>
                <span>{drill.difficulty}</span>
                <span>·</span>
                <span>
                  {drill.playerCountMin === drill.playerCountMax
                    ? `${drill.playerCountMin} players`
                    : `${drill.playerCountMin}-${drill.playerCountMax} players`}
                </span>
                {drill.equipment.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{drill.equipment.join(", ")}</span>
                  </>
                )}
              </div>
              {drill.instructions.length > 0 && (
                <ol className="print-sheet-steps">
                  {drill.instructions.map((step, si) => (
                    <li key={si}>{step}</li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
