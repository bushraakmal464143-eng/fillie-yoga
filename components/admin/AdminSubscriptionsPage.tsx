"use client";

import { formatWhen } from "./admin-shared";
import { useMembersActivity } from "./useMembersActivity";

export default function AdminSubscriptionsPage() {
  const { subscriptions, note } = useMembersActivity();

  return (
    <section className="admin-card admin-card--wide admin-activity">
      <div className="admin-card-head">
        <div>
          <p className="admin-card-kicker">Audience</p>
          <h2>Subscriptions</h2>
        </div>
        <span className="admin-count-pill">{subscriptions.length}</span>
      </div>
      <p>Paid memberships with plan name and status.</p>

      {note && <p className="admin-banner admin-banner--error">{note}</p>}

      <div className="admin-table-wrap">
        {subscriptions.length === 0 ? (
          <p className="admin-empty">
            No paid subscriptions recorded yet. Once Stripe checkout is connected, purchases will
            show here with member name, plan, and status.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Started</th>
                <th>Period ends</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <strong>{sub.userName || "—"}</strong>
                    <span className="admin-table-meta">{sub.userEmail || sub.userId}</span>
                  </td>
                  <td>{sub.planName}</td>
                  <td>
                    <span
                      className={`admin-status${sub.status === "active" ? " is-ok" : " is-warn"}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td>{formatWhen(sub.createdAt)}</td>
                  <td>{formatWhen(sub.currentPeriodEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
