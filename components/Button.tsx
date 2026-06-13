import Link from "next/link";

type Variant = "primary" | "secondary" | "danger" | "success" | "outline";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  success: "btn-success",
  outline: "btn-outline",
};

interface ButtonProps {
  variant?: Variant;
  href?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function Button({
  variant = "primary",
  href,
  children,
  type = "button",
  disabled,
  onClick,
  className,
  style,
}: ButtonProps) {
  const cls = [variantClass[variant], className].filter(Boolean).join(" ");

  if (href) {
    const isAnchor = href.startsWith("#") || href.startsWith("/#");
    if (isAnchor) {
      return (
        <a href={href} className={cls} style={style}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
}
