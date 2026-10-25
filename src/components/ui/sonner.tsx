import { useTheme } from "@/components/ThemeProvider";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-card !text-card-foreground !border-border !shadow-[0_8px_24px_rgba(0,0,0,0.12)] !ring-1 !ring-border/50 font-sans rounded-lg",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs font-medium rounded-md",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs font-medium rounded-md",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

