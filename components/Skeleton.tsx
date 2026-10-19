type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: React.CSSProperties;
};

function toCssSize(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton({ className = "", width, height, radius, style }: SkeletonProps) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      style={{
        width: toCssSize(width),
        height: toCssSize(height),
        borderRadius: toCssSize(radius),
        ...style,
      }}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`skeleton-stack${className ? ` ${className}` : ""}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className="skeleton--line"
          width={index === lines - 1 && lines > 1 ? "68%" : "100%"}
          height={12}
        />
      ))}
    </div>
  );
}

export function NavAuthSkeleton() {
  return (
    <div className="nav-auth-skeleton" aria-busy="true" aria-label="Loading account">
      <Skeleton className="skeleton--nav-btn" width={84} height={34} radius={7} />
      <Skeleton className="skeleton--nav-btn skeleton--nav-btn-wide" width={118} height={34} radius={7} />
    </div>
  );
}

export function NavAuthMobileSkeleton() {
  return (
    <div className="nav-auth-skeleton nav-auth-skeleton--mobile" aria-busy="true" aria-label="Loading account">
      <Skeleton width="100%" height={40} radius={7} />
    </div>
  );
}

export function BookPanelSkeleton() {
  return (
    <div className="sub-gate-box book-panel-skeleton" aria-busy="true" aria-label="Loading">
      <Skeleton width="42%" height={18} radius={6} />
      <SkeletonText lines={2} />
      <Skeleton width="100%" height={44} radius={8} style={{ marginTop: "0.75rem" }} />
      <Skeleton width="100%" height={40} radius={8} />
    </div>
  );
}

export function AdminTableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="admin-skeleton-table" aria-busy="true" aria-label="Loading">
      <div className="admin-skeleton-row admin-skeleton-row--head">
        {Array.from({ length: cols }, (_, index) => (
          <Skeleton key={index} height={12} width={index === 0 ? "55%" : "70%"} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="admin-skeleton-row">
          {Array.from({ length: cols }, (_, col) => (
            <Skeleton
              key={col}
              height={14}
              width={col === 0 ? "62%" : col === cols - 1 ? "48%" : "78%"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="admin-skeleton-list" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="admin-skeleton-list-item">
          <div className="admin-skeleton-list-copy">
            <Skeleton width="46%" height={14} />
            <Skeleton width="28%" height={11} />
          </div>
          <div className="admin-skeleton-list-actions">
            <Skeleton width={52} height={28} radius={6} />
            <Skeleton width={58} height={28} radius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminLoadingSkeleton() {
  return (
    <div className="admin-loading admin-loading--skeleton" role="status" aria-label="Loading studio desk">
      <div className="admin-skeleton-card">
        <Skeleton width="34%" height={14} />
        <Skeleton width="58%" height={24} style={{ marginTop: "0.75rem" }} />
        <div style={{ marginTop: "1.25rem" }}>
          <AdminListSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}
