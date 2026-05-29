import React from "react";
import styles from "./Table.module.css";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowStyle?: (row: T) => React.CSSProperties;
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  rowStyle,
}: TableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} style={rowStyle ? rowStyle(row) : undefined}>
                {columns.map((col, j) => (
                  <td key={j}>
                    {col.render
                      ? col.render(row)
                      : col.accessor
                      ? String(row[col.accessor])
                      : null}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                Nenhum dado encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
