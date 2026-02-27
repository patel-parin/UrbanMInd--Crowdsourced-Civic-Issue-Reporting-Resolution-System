import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, MapPin, Upload, X, AlertTriangle, Mic, Square, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import GlassCard from '../../components/common/GlassCard';
import { issueService } from '../../api/services/issueService';

const ReportIssue = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "pothole",
        priority: "medium",
        lat: "",
        lng: "",
        address: "",
    });

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [isRecording, setIsRecording] = useState(false);
    const [voiceNote, setVoiceNote] = useState(null);
    const [voiceNoteUrl, setVoiceNoteUrl] = useState(null);

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const categories = [
        { value: "pothole", label: "Pothole" },
        { value: "garbage", label: "Garbage Dump" },
        { value: "streetlight", label: "Broken Streetlight" },
        { value: "water", label: "Water Leakage" },
        { value: "other", label: "Other" },
    ];

    const priorities = [
        { value: "low", label: "Low", color: "text-blue-400" },
        { value: "medium", label: "Medium", color: "text-yellow-400" },
        { value: "high", label: "High", color: "text-orange-400" },
        { value: "critical", label: "Critical", color: "text-red-400" },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = [...images, ...files];
            const newPreviews = [...previewUrls, ...files.map(file => URL.createObjectURL(file))];

            if (newImages.length > 3) {
                toast.error("Maximum 3 images allowed");
                return;
            }

            setImages(newImages);
            setPreviewUrls(newPreviews);
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviewUrls(newPreviews);
    };

    // Voice Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setVoiceNote(new File([blob], "voicenote.webm", { type: "audio/webm" }));
                setVoiceNoteUrl(url);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const deleteVoiceNote = () => {
        setVoiceNote(null);
        setVoiceNoteUrl(null);
    };

    // ⭐ Fetch Address Using OpenStreetMap Reverse Geocoding
    const fetchAddressFromCoordinates = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();

            const address =
                data?.display_name ||
                data?.address?.city ||
                data?.address?.town ||
                data?.address?.village ||
                "Unknown Location";

            setFormData((prev) => ({
                ...prev,
                address: address,
            }));
        } catch (err) {
            console.log("Error fetching address:", err);
        }
    };

    // ⭐ Fetch GPS + Address
    const getLocation = () => {
        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setFormData((prev) => ({
                    ...prev,
                    lat,
                    lng,
                }));

                await fetchAddressFromCoordinates(lat, lng);

                toast.success("Location fetched");
                setLocationLoading(false);
            },
            () => {
                toast.error("Unable to fetch location");
                setLocationLoading(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("category", formData.category);
            data.append("priority", formData.priority);
            data.append("lat", formData.lat);
            data.append("lng", formData.lng);
            data.append("address", formData.address);

            images.forEach((img) => {
                data.append("images", img);
            });

            if (voiceNote) {
                data.append("voiceNote", voiceNote);
            }

            await issueService.create(data);

            toast.success("Issue Reported Successfully!");
            navigate("/citizen/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Failed to report issue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 animate-fade-in">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200 mb-3">
                    Report an Issue
                </h1>
                <p className="text-gray-400 text-lg">Help improve our city by reporting problems you see.</p>
            </div>

            <GlassCard className="p-8 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Issue Title</label>
                        <Input
                            name="title"
                            placeholder="e.g., Deep Pothole on 5th Avenue"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="bg-white/5 border-white/10 focus:border-indigo-500/50 focus:bg-white/10 transition-all duration-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent appearance-none transition-all duration-300 cursor-pointer hover:bg-white/10"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value} className="bg-gray-900">
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Priority Level</label>
                            <div className="relative">
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent appearance-none transition-all duration-300 cursor-pointer hover:bg-white/10"
                                >
                                    {priorities.map((p) => (
                                        <option key={p.value} value={p.value} className="bg-gray-900">
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Location Button */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Location</label>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={getLocation}
                            isLoading={locationLoading}
                            icon={MapPin}
                            className="w-full h-[50px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 justify-center"
                        >
                            {formData.address ? 'Update Location' : 'Fetch Current Location'}
                        </Button>
                    </div>

                    {/* Location Details (Read-only) */}
                    {(formData.lat || formData.address) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                        >
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-white">Detected Location</p>
                                    <p className="text-sm text-gray-400 mt-1">{formData.address || "Fetching address..."}</p>
                                    <div className="flex gap-4 mt-2 text-xs text-gray-500 font-mono">
                                        <span>Lat: {formData.lat}</span>
                                        <span>Lng: {formData.lng}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Description & Voice Note */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300 ml-1">Description</label>
                            {/* Voice Recorder Button */}
                            {!voiceNoteUrl && (
                                <button
                                    type="button"
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${isRecording
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Mic className="w-3 h-3" />}
                                    {isRecording ? 'Stop Recording' : 'Add Voice Note'}
                                </button>
                            )}
                        </div>

                        {voiceNoteUrl && (
                            <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-3">
                                <audio src={voiceNoteUrl} controls className="h-8 w-full" />
                                <button type="button" onClick={deleteVoiceNote} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <textarea
                            name="description"
                            rows="4"
                            placeholder="Describe the issue in detail..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 placeholder-gray-500 resize-none"
                            value={formData.description}
                            onChange={handleChange}
                            required={!voiceNote} // Optional if voice note exists
                        />
                    </div>

                    {/* Multi-Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Evidence Photos (Max 3)</label>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {previewUrls.length < 3 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Add Photo</span>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 border-none py-4 text-lg font-bold"
                            size="lg"
                            icon={Upload}
                            isLoading={loading}
                        >
                            Submit Report
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default ReportIssue;
