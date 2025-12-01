import "./AdminPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../auth";

const API_BASE = "http://localhost:4000/api";

export default function AdminPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  function getAllNotesFromLocalStorage() {
    const allNotes = JSON.parse(localStorage.getItem("cn_notes") || "[]");
    const allUsers = JSON.parse(localStorage.getItem("cn_users") || "[]");

    return allNotes.map((note) => {
      const noteUser = allUsers.find((u) => u.id === note.userId);
      return {
        ...note,
        userId: noteUser
          ? {
              name: noteUser.name,
              email: noteUser.email,
            }
          : {
              name: "Unknown",
              email: "N/A",
            },
      };
    });
  }

  useEffect(() => {
    if (!user || user.role !== "admin") {
      alert("Access denied — Admins only");
      navigate("/notes");
      return;
    }

    async function loadAllNotes() {
      try {
        const token = localStorage.getItem("cn_token");
        const res = await fetch(`${API_BASE}/admin/all-notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          alert("Not authorized");
          navigate("/notes");
          return;
        }

        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.log("Backend unavailable, using localStorage");
        const localNotes = getAllNotesFromLocalStorage();
        setNotes(localNotes);
      } finally {
        setLoading(false);
      }
    }

    loadAllNotes();
  }, [navigate, user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-wrapper">
      <h2>Admin Panel</h2>
      <p>All Notes from All Users</p>

      {notes.length === 0 ? (
        <div>No notes found</div>
      ) : (
        notes.map((n) => (
          <div key={n._id} className="admin-note-card">
            <h4>{n.title}</h4>
            <p>{n.content}</p>
            <small>
              User: {n.userId?.name} ({n.userId?.email})
            </small>
          </div>
        ))
      )}

      <button className="admin-back-btn" onClick={() => navigate("/notes")}>
        Back
      </button>
    </div>
  );
}
