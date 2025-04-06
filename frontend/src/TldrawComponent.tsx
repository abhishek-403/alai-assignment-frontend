import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Editor, Tldraw, createShapeId, toRichText } from "tldraw";
import "tldraw/tldraw.css";
import { createArrowBetweenShapes } from "./utils/tldraw-utils";

const HUB_RADIUS = 100;
const HUB_ID = createShapeId("hub");

export default function HubAndSpokesCanvas() {
  const editorRef = useRef<Editor | null>(null);
  const [spokeCount, setSpokeCount] = useState(0);

  const initializeHub = (editor: Editor) => {
    const center = editor.getViewportScreenCenter();
    editor.createShape({
      id: HUB_ID,
      type: "geo",
      x: center.x - HUB_RADIUS,
      y: center.y - HUB_RADIUS,
      props: {
        geo: "ellipse",
        w: HUB_RADIUS * 2,
        h: HUB_RADIUS * 2,
        richText: toRichText("HUB"),
        fill: "solid",
        color: "orange",
        size: "m",
        font: "draw",
        verticalAlign: "middle",
      },
    });

    editor.bringToFront([HUB_ID]);
  };
  const addSpoke = () => {
    const editor = editorRef.current;
    if (!editor) return;

    if (spokeCount >= 6) {
      toast.error("Maximum 6 spokes allowed");
      return;
    }

    const centerShape = editor.getShape(HUB_ID);
    if (!centerShape) return;

    const cx = centerShape.x + HUB_RADIUS;
    const cy = centerShape.y + HUB_RADIUS;

    const angleDeg = (360 / 6) * spokeCount;
    const angleRad = (angleDeg * Math.PI) / 180;
    const length = 200;

    const endX = cx + Math.cos(angleRad) * length;
    const endY = cy + Math.sin(angleRad) * length;

    const labelId = createShapeId(`label-${spokeCount}`);
    const textContent = toRichText(`Spoke ${spokeCount + 1}`);

    const labelOffset = 30;
    const labelX = endX + Math.cos(angleRad) * labelOffset - 50;
    const labelY = endY + Math.sin(angleRad) * labelOffset - 20;

    editor.createShape({
      id: labelId,
      type: "text",
      x: labelX,
      y: labelY,
      props: {
        richText: textContent,
        size: "s",
        font: "draw",
        color: "black",
      },
    });

    createArrowBetweenShapes(editor, HUB_ID, labelId);

    setSpokeCount((prev) => prev + 1);

    editor.bringToFront([HUB_ID]);
  };

  return (
    <div>
      <button
        onClick={addSpoke}
        style={{
          position: "absolute",
          zIndex: 10,
          top: 20,
          left: 20,
          padding: "8px 12px",
          background: "#222",
          color: "white",
          borderRadius: "6px",
        }}
      >
        ➕ Add Spoke
      </button>

      <div className="fixed inset-0 ">
        <Tldraw
          hideUi
          onMount={(editor) => {
            editorRef.current = editor;
            initializeHub(editor);

            const handleKeyDown = (e: KeyboardEvent) => {
              if (e.ctrlKey && e.key === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                  editor.redo();
                } else {
                  editor.undo();
                }
              }
            };

            window.addEventListener("keydown", handleKeyDown);

            const cleanup = editor.store.listen(
              (event: any) => {
                if (event.source !== "user") return;

                const deletedShapeIds: string[] =
                  event.changes?.shape?.deleted || [];

                const deletedLabels = deletedShapeIds.filter((id: string) =>
                  id.includes("label-")
                );

                if (deletedLabels.length > 0) {
                  setSpokeCount((prev) =>
                    Math.max(0, prev - deletedLabels.length)
                  );
                }
              },
              { source: "user", scope: "document" }
            );

            return () => {
              window.removeEventListener("keydown", handleKeyDown);
              cleanup();
            };
          }}
        />
      </div>
    </div>
  );
}
