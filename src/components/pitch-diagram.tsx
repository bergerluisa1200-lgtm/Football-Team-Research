import { PitchElement } from "@/types/drill";
import { PitchSvg } from "./pitch-svg";
import { PitchElementComponent } from "./pitch-element";

interface Props {
  elements: PitchElement[];
  className?: string;
}

export function PitchDiagram({ elements, className }: Props) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 100 100"
        className="w-full rounded-lg shadow-lg border border-border overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        <PitchSvg />
        {elements.map((el, i) => (
          <PitchElementComponent key={i} element={el} />
        ))}
      </svg>
    </div>
  );
}
