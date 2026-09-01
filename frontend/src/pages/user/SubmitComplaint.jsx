import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaintRequest } from "../../api/complaints";
import ComplaintForm from "../../components/complaints/ComplaintForm";
import Alert from "../../components/common/Alert";
import "./SubmitComplaint.css";

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setError("");
    setSubmitting(true);
    try {
      await createComplaintRequest(values);
      navigate("/user/my-complaints");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Submit a Complaint</h1>
      </div>
      <Alert type="error">{error}</Alert>
      <div className="card submit-complaint-card">
        <ComplaintForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
