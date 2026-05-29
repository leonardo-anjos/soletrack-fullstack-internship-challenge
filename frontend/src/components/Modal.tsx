import React from "react";
import styles from "./Modal.module.css";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  variant = "default",
}) => {
  if (!isOpen) return null;

  const headerClass = [
    styles.header,
    variant === "warning" ? styles.headerWarning : "",
    variant === "danger" ? styles.headerDanger : "",
  ].join(" ");

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={headerClass}>
          <h2 className={styles.title}>{title}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className={styles.closeIcon}
          >
            &times;
          </Button>
        </div>

        <div className={styles.body}>{children}</div>

        <div className={styles.footer}>
          {footer ? (
            footer
          ) : (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;