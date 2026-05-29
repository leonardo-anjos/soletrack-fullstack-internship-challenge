import React from "react";
import styles from "./Card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  variant?: "blue" | "orange" | "green" | "purple";
}

const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  children,
  variant = "blue",
  className,
  ...rest
}) => {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${className || ""}`}
      {...rest}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.info}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {value !== undefined && <p className={styles.value}>{value}</p>}
        </div>

        {icon && <div className={styles.iconContainer}>{icon}</div>}
      </div>

      {children}
    </div>
  );
};

export default Card;