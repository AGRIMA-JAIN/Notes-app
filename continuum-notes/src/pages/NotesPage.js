import "./NotesPage.css";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../auth";

const API_BASE = "http://localhost:4000/api";

const MOCK_FOCUS_NOTE = {
  id: "focus",
  title: "Today's focus",
  content: "Capture your ideas, tasks, and reminders in one clean place.",
  category: "Other",
};

const CATEGORIES = ["All", "Work", "Personal", "Study", "Other"];

export default function NotesPage({ user: propUser, onLogout }) {
  const navigate = useNavigate();
  const user = propUser || getCurrentUser();

  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const [showLogout, setShowLogout] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    content: "",
    category: "Work",
  });

  const [time, setTime] = useState("");

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(formatted);
    }

    updateTime();
    const intervalId = setInterval(updateTime, 30000);

    return () => clearInterval(intervalId);
  }, []);

  function getLocalNotes() {
    const currentUser = JSON.parse(localStorage.getItem("cn_currentUser"));
    if (!currentUser) return [];

    const allNotes = JSON.parse(localStorage.getItem("cn_notes") || "[]");
    return allNotes.filter((note) => note.userId === currentUser.id);
  }

  function saveLocalNotes(updatedNotes) {
    const currentUser = JSON.parse(localStorage.getItem("cn_currentUser"));
    if (!currentUser) return;

    const allNotes = JSON.parse(localStorage.getItem("cn_notes") || "[]");
    const otherUserNotes = allNotes.filter(
      (note) => note.userId !== currentUser.id
    );
    const combinedNotes = [...otherUserNotes, ...updatedNotes];

    localStorage.setItem("cn_notes", JSON.stringify(combinedNotes));
  }

  useEffect(() => {
    async function loadNotes() {
      try {
        const token = localStorage.getItem("cn_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/notes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to load notes", await res.text());
          return;
        }

        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.log("Backend unavailable, using localStorage");
        const localNotes = getLocalNotes();
        setNotes(localNotes);
      }
    }

    loadNotes();
  }, []);

  function openNewNote() {
    setEditingNote(null);
    setDraft({ title: "", content: "", category: "Work" });
    setEditorOpen(true);
  }

  function openEdit(note) {
    setEditingNote(note);
    setDraft({
      title: note.title,
      content: note.content,
      category: note.category || "Other",
    });
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
  }

  function handleDraftChange(e) {
    const { name, value } = e.target;
    setDraft((d) => ({ ...d, [name]: value }));
  }

  async function handleSaveNote(e) {
    e.preventDefault();

    const trimmedTitle = draft.title.trim();
    const trimmedContent = draft.content.trim();
    if (!trimmedTitle && !trimmedContent) return;

    const token = localStorage.getItem("cn_token");
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("cn_currentUser"));

    try {
      if (editingNote) {
        const res = await fetch(`${API_BASE}/notes/${editingNote._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: trimmedTitle,
            content: trimmedContent,
            category: draft.category,
          }),
        });

        if (!res.ok) {
          console.error("Failed to update note", await res.text());
          return;
        }

        const updated = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n._id === updated._id ? updated : n))
        );
      } else {
        const res = await fetch(`${API_BASE}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: trimmedTitle || "Untitled",
            content: trimmedContent,
            category: draft.category,
          }),
        });

        if (!res.ok) {
          console.error("Failed to create note", await res.text());
          return;
        }

        const created = await res.json();
        setNotes((prev) => [created, ...prev]);
      }

      setEditorOpen(false);
    } catch (err) {
      console.log("Backend unavailable, using localStorage");

      if (editingNote) {
        const updated = {
          ...editingNote,
          title: trimmedTitle,
          content: trimmedContent,
          category: draft.category,
          updatedAt: new Date().toISOString(),
        };

        const updatedNotes = notes.map((n) =>
          n._id === editingNote._id ? updated : n
        );
        setNotes(updatedNotes);
        saveLocalNotes(updatedNotes);
      } else {
        const newNote = {
          _id: Date.now().toString(),
          title: trimmedTitle || "Untitled",
          content: trimmedContent,
          category: draft.category,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        saveLocalNotes(updatedNotes);
      }

      setEditorOpen(false);
    }
  }

  async function handleDelete(noteId) {
    if (!window.confirm("Delete this note?")) return;

    const token = localStorage.getItem("cn_token");
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to delete note", await res.text());
        return;
      }

      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.log("Backend unavailable, using localStorage");

      const updatedNotes = notes.filter((n) => n._id !== noteId);
      setNotes(updatedNotes);
      saveLocalNotes(updatedNotes);
    }
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("cn_currentUser");
      localStorage.removeItem("cn_token");
    }
    setShowLogout(false);
    navigate("/login");
  }

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesTab = activeTab === "All" ? true : n.category === activeTab;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [notes, activeTab, search]);

  const displayName = user?.name || "Agrima";

  return (
    <div className="auth-screen">
      <div className="auth-phone notes-phone">
        <div className="auth-status-bar">
          <span>{time}</span>
          <span>📶 🔋</span>
        </div>

        <div className="notes-header">
          <div className="notes-title">Hello {displayName}</div>
          <div className="notes-subtitle">Here are your notes today</div>
        </div>

        <div className="notes-search-wrapper">
          <input
            className="notes-search"
            type="text"
            placeholder="Search notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="notes-tabs">
          {CATEGORIES.map((tab) => (
            <button
              key={tab}
              className={
                "notes-tab " + (activeTab === tab ? "notes-tab-active" : "")
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="note-card">
          <div className="note-main">
            <div>
              <div className="note-title">{MOCK_FOCUS_NOTE.title}</div>
              <div className="note-body">{MOCK_FOCUS_NOTE.content}</div>
            </div>
          </div>
        </div>

        <div className="notes-list">
          {filteredNotes.map((note) => (
            <div key={note._id} className="note-card">
              <div className="note-main" onClick={() => openEdit(note)}>
                <div>
                  <div className="note-title">{note.title}</div>
                  <div className="note-body">{note.content}</div>
                </div>
                <span className="note-chip">{note.category}</span>
              </div>

              <div className="note-actions">
                <button
                  className="note-edit-btn"
                  type="button"
                  onClick={() => openEdit(note)}
                >
                  Edit
                </button>
                <button
                  className="note-delete-btn"
                  type="button"
                  onClick={() => handleDelete(note._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="notes-empty">
              No notes yet. Create your first one above!
            </div>
          )}
        </div>

        {user?.role !== "admin" && (
          <button type="button" className="new-note-btn" onClick={openNewNote}>
            + New Note
          </button>
        )}

        {user?.role === "admin" && (
          <button
            className="admin-btn"
            type="button"
            onClick={() => navigate("/admin")}
          >
            Admin Panel
          </button>
        )}

        <button
          className="logout-bottom-btn"
          type="button"
          onClick={() => setShowLogout(true)}
        >
          Sign Out
        </button>
      </div>

      {showLogout && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <div className="logout-message">Do you want to Sign out?</div>
            <div className="logout-btn-container">
              <button className="logout-yes" onClick={handleLogout}>
                Yes
              </button>
              <button
                className="logout-no"
                onClick={() => setShowLogout(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {editorOpen && (
        <div className="editor-overlay">
          <div className="editor-modal">
            <h3 className="editor-title">
              {editingNote ? "Edit Note" : "New Note"}
            </h3>

            <form className="editor-form" onSubmit={handleSaveNote}>
              <div className="editor-field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  className="editor-input"
                  value={draft.title}
                  onChange={handleDraftChange}
                  placeholder="Note title"
                />
              </div>

              <div className="editor-field">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  className="editor-textarea"
                  value={draft.content}
                  onChange={handleDraftChange}
                  placeholder="Write your note..."
                />
              </div>

              <div className="editor-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="editor-select"
                  value={draft.category}
                  onChange={handleDraftChange}
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Study">Study</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="editor-actions">
                <button
                  type="button"
                  className="editor-cancel"
                  onClick={closeEditor}
                >
                  Cancel
                </button>
                <button type="submit" className="editor-save">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
