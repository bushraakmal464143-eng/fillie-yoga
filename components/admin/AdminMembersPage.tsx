"use client";

import { formatWhen } from "./admin-shared";
import { useMembersActivity } from "./useMembersActivity";

export default function AdminMembersPage() {
  const { members, note } = useMembersActivity();

  return (
    <section className="admin-card admin-card--wide admin-activity">
      <div className="admin-card-head">
        <div>
          <p className="admin-card-kicker">Audience</p>
          <h2>Members</h2>
        </div>
        <span className="admin-count-pill">{members.length}</span>
      </div>
      <p>People who created an account on the site.</p>

      {note && <p className="admin-banner admin-banner--error">{note}</p>}

      <div className="admin-table-wrap">
        {members.length === 0 ? (
          <p className="admin-empty">No members yet. Signups will appear here.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.name || "—"}</strong>
                  </td>
                  <td>{member.email || "—"}</td>
                  <td>{formatWhen(member.createdAt)}</td>
                  <td>
                    <span
                      className={`admin-status${member.emailConfirmed ? " is-ok" : " is-warn"}`}
                    >
                      {member.emailConfirmed ? "Verified" : "Unverified"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
