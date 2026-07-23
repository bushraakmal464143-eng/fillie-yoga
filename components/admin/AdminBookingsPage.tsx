"use client";

import { formatWhen } from "./admin-shared";
import { useMembersActivity } from "./useMembersActivity";

export default function AdminBookingsPage() {
  const { bookings, note } = useMembersActivity();

  return (
    <section className="admin-card admin-card--wide admin-activity">
      <div className="admin-card-head">
        <div>
          <p className="admin-card-kicker">Audience</p>
          <h2>Bookings</h2>
        </div>
        <span className="admin-count-pill">{bookings.length}</span>
      </div>
      <p>Class bookings from members and guests.</p>

      {note && <p className="admin-banner admin-banner--error">{note}</p>}

      <div className="admin-table-wrap">
        {bookings.length === 0 ? (
          <p className="admin-empty">No class bookings in the database yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Guest</th>
                <th>Type</th>
                <th>Session</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{formatWhen(booking.bookedAt)}</td>
                  <td>
                    <strong>{booking.guestName || "—"}</strong>
                    <span className="admin-table-meta">{booking.guestEmail || "—"}</span>
                  </td>
                  <td>{booking.bookingType}</td>
                  <td>#{booking.sessionId}</td>
                  <td>
                    <span
                      className={`admin-status${booking.cancelledAt ? " is-warn" : " is-ok"}`}
                    >
                      {booking.cancelledAt ? "Cancelled" : "Booked"}
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
