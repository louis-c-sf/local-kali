import { useEffect } from "react";
import { ATTACHABLE_IMAGE_TYPES } from "../../component/Chat/AttachedFiles";

export function useImageClipboard(props: {
  elementRef: HTMLElement | null;
  onPaste: (image: File) => void;
}) {
  const { elementRef, onPaste } = props;

  useEffect(() => {
    if (null === elementRef) {
      return;
    }

    let handler: ((event: ClipboardEvent) => void) | null = (
      event: ClipboardEvent
    ) => {
      const items = event.clipboardData?.items ?? [];
      const firstImage = Array.from(items).reduce<File | undefined>(
        (acc, next) => {
          const file = next.getAsFile();
          if (
            acc === undefined &&
            file?.type &&
            ATTACHABLE_IMAGE_TYPES.includes(file.type)
          ) {
            return file;
          }
          return acc;
        },
        undefined
      );
      if (firstImage) {
        event.preventDefault();
        event.stopPropagation();
        onPaste(firstImage);
      }
    };

    elementRef.addEventListener("paste", handler);

    return () => {
      if (handler && elementRef) {
        elementRef.removeEventListener("paste", handler);
        handler = null;
      }
    };
  }, [elementRef]);
}
