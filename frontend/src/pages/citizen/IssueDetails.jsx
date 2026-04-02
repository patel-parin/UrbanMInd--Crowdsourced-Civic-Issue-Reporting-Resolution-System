import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mic,
  ThumbsUp,
  Star,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Button from "../../components/common/Button";
import GlassCard from "../../components/common/GlassCard";
import Loader from "../../components/common/Loader";
import { issueService } from "../../api/services/issueService";
import { useAuth } from "../../context/AuthContext";
import IssueMap from "../../components/map/IssueMap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [upvoting, setUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const data = await issueService.getById(id);
        setIssue(data);
        if (user && data.upvotedBy?.includes(user._id)) {
          setHasUpvoted(true);
        }
        if (data.feedback?.rating) {
          setFeedbackRating(data.feedback.rating);
          setFeedbackComment(data.feedback.comment || "");
        }
      } catch (error) {
        console.error("Failed to fetch issue details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id, user]);

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    try {
      const result = await issueService.upvote(issue._id);
      setIssue(prev => ({ ...prev, upvotes: result.upvotes }));
      setHasUpvoted(result.hasUpvoted);
    } catch (error) {
      console.error("Failed to upvote:", error);
    } finally {
      setUpvoting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0 || submittingFeedback) return;
    setSubmittingFeedback(true);
    try {
      await issueService.submitFeedback(issue._id, feedbackRating, feedbackComment);
      setIssue(prev => ({
        ...prev,
        feedback: { rating: feedbackRating, comment: feedbackComment, userId: user._id }
      }));
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      reported: { bg: "bg-orange-500/20", text: "text-orange-400", icon: AlertTriangle },
      assigned: { bg: "bg-blue-500/20", text: "text-blue-400", icon: User },
      under_contractor_survey: { bg: "bg-cyan-500/20", text: "text-cyan-400", icon: Clock },
      fund_approval_pending: { bg: "bg-amber-500/20", text: "text-amber-400", icon: Clock },
      in_progress: { bg: "bg-indigo-500/20", text: "text-indigo-400", icon: Clock },
      resolved: { bg: "bg-green-500/20", text: "text-green-400", icon: CheckCircle },
      closed: { bg: "bg-gray-500/20", text: "text-gray-400", icon: CheckCircle },
    };
    return configs[status] || configs.reported;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" color="indigo" />
      </div>
    );
  }

  if (!issue) return (
    <div className="text-center py-20">
      <p className="text-gray-400 text-lg">Issue not found</p>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
    </div>
  );

  const statusConfig = getStatusConfig(issue.status);
  const StatusIcon = statusConfig.icon;
  const images = issue.images || [];
  const isResolved = issue.status === "resolved" || issue.status === "closed";
  const hasFeedback = issue.feedback?.rating > 0;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-400"
        onClick={() => navigate(-1)}
        icon={ArrowLeft}
      >
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* IMAGE GALLERY */}
            {images.length > 0 && (
              <div className="rounded-2xl overflow-hidden mb-6 shadow-2xl relative group border border-white/10">
                <img
                  src={images[currentImageIndex]?.startsWith("/uploads")
                    ? `${API_URL}${images[currentImageIndex]}`
                    : images[currentImageIndex]
                  }
                  alt={`${issue.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-64 md:h-80 object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800";
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-white scale-125" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-white">{issue.title}</h1>
              {/* Upvote Button */}
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shrink-0 ${
                  hasUpvoted
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-indigo-400" : ""}`} />
                <span>{issue.upvotes || 0}</span>
              </button>
            </div>

            {/* DESCRIPTION */}
            <GlassCard className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed">{issue.description}</p>

              {issue.voiceNoteUrl && (
                <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Voice Note
                  </h4>
                  <audio
                    controls
                    className="w-full h-8"
                    src={issue.voiceNoteUrl.startsWith('/uploads') ? `${API_URL}${issue.voiceNoteUrl}` : issue.voiceNoteUrl}
                  />
                </div>
              )}
            </GlassCard>

            {/* FEEDBACK SECTION */}
            {isResolved && (
              <GlassCard>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  {hasFeedback ? "Your Feedback" : "Rate this Resolution"}
                </h3>

                {hasFeedback ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${star <= issue.feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                        />
                      ))}
                      <span className="text-gray-400 text-sm ml-2">{issue.feedback.rating}/5</span>
                    </div>
                    {issue.feedback.comment && (
                      <p className="text-gray-300 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                        "{issue.feedback.comment}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setFeedbackHover(star)}
                          onMouseLeave={() => setFeedbackHover(0)}
                          className="p-1 transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= (feedbackHover || feedbackRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows="3"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all placeholder-gray-500 resize-none"
                    />
                    <Button
                      onClick={handleFeedbackSubmit}
                      isLoading={submittingFeedback}
                      disabled={feedbackRating === 0}
                      icon={Send}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none shadow-lg shadow-indigo-500/20"
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </GlassCard>
            )}

            {/* TIMELINE */}
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-gray-900" />
                  <p className="text-sm text-gray-400 mb-1">{new Date(issue.createdAt).toLocaleString()}</p>
                  <h4 className="text-white font-medium">Issue Reported</h4>
                </div>
                {issue.contractorId && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-gray-900" />
                    <h4 className="text-white font-medium">Assigned to {issue.contractorId?.name || issue.contractorId?.companyName || "Contractor"}</h4>
                  </div>
                )}
                {issue.status === "resolved" && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900" />
                    <p className="text-sm text-gray-400 mb-1">{new Date(issue.updatedAt).toLocaleString()}</p>
                    <h4 className="text-white font-medium">Issue Resolved</h4>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* STATUS CARD */}
          <GlassCard>
            <div className="mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-4 h-4 mr-2" />
                {issue.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="space-y-5">
              {/* DATE */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Reported On</p>
                  <p className="text-white font-medium">
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-white font-medium text-sm leading-relaxed">
                    {issue.gps?.address || "Unknown Address"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    City: {issue.city || "N/A"}
                  </p>
                </div>
              </div>

              {/* ASSIGNED TO */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="text-white font-medium">
                    {issue.contractorId?.name || issue.contractorId?.companyName || "Unassigned"}
                  </p>
                </div>
              </div>

              {/* UPVOTES */}
              <div className="flex items-start gap-3">
                <ThumbsUp className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Upvotes</p>
                  <p className="text-white font-medium">{issue.upvotes || 0}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* MAP PREVIEW */}
          <GlassCard className="h-64 p-2">
            {issue.gps?.lat && issue.gps?.lng ? (
              <IssueMap
                lat={issue.gps.lat}
                lng={issue.gps.lng}
                title={issue.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No GPS location available
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
