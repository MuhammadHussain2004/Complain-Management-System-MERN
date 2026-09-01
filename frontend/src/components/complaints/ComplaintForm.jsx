import { useState } from "react";
import { CATEGORIES, PRIORITIES } from "../../constants";
import "./ComplaintForm.css";

export default function ComplaintForm({ initialValues, submitLabel = "Submit Complaint", onSubmit, submitting }) {
  const [form, setForm] = useState({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: initialValues?.category || CATEGORIES[0],
    priority: initialValues?.priority || "Medium",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          placeholder="Brief summary of the issue"
        />
      </div>

      <div className="complaint-form-row">
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the issue in detail..."
        />
      </div>

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
