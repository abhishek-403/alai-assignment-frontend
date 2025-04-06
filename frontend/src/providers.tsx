import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";

export function ToastProvider() {
  const { toasts } = useToasterStore();
  const limit = 3;
  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= limit)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts, limit]);

  return (
    <Toaster
      position={"bottom-right"}
      containerStyle={{
        zIndex: 9999,
      }}
    />
  );
}

type Props = { children: React.ReactNode };

export default function Providers({ children }: Props) {
  return (
    <>
      <ToastProvider />
      {children}
    </>
  );
}
