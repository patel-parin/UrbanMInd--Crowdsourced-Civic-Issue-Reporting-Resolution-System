import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowLeft, Phone, HardHat } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import GlassCard from "../../components/common/GlassCard";
import ParticleBackground from "../../components/ParticleBackground";

import { locationData } from "../../data/locations";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState("citizen");

  // Prevent admin registration
  useEffect(() => {
    const initialRole =
      location.state?.role === "admin" || location.state?.role === "superadmin"
        ? "citizen"
        : location.state?.role || "citizen";

    setRole(initialRole);
  }, [location.state]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    state: "",
    district: "",
    taluka: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle Location Change
  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    if (name === "state") {
      setFormData({
        ...formData,
        state: value,
        district: "",
        taluka: "",
        city: "",
      });
    } else if (name === "district") {
      setFormData({
        ...formData,
        district: value,
        taluka: "",
        city: "",
      });
    } else if (name === "taluka") {
      setFormData({
        ...formData,
        taluka: value,
        city: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await register({ ...formData, role });
      if (!success) setLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Roles Tabs
  const roles = [
    {
      id: "citizen",
      label: "Citizen",
      icon: User,
      activeClass: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    },
    {
      id: "contractor",
      label: "Contractor",
      icon: HardHat,
      activeClass: "bg-orange-500/20 text-orange-300 border-orange-500/50",
    },
  ];

  return (
    // ✅ FIXED SCROLL ISSUE
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0f172a] overflow-y-auto">
      {/* Background */}
      <ParticleBackground />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 pl-0 hover:bg-transparent text-gray-400 hover:text-white group"
            onClick={() => navigate("/login", { state: { role } })}
            icon={ArrowLeft}
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block">
              Back to Login
            </span>
          </Button>
        </motion.div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ✅ Card Scroll Support */}
          <GlassCard className="p-8 md:p-10 max-h-[90vh] overflow-y-auto backdrop-blur-2xl border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-gray-400">
                Join as a{" "}
                <span className="text-indigo-400 font-semibold capitalize">
                  {role}
                </span>
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1 mb-8 bg-black/20 rounded-xl border border-white/5">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);

                    // ✅ Clear location if citizen
                    if (r.id === "citizen") {
                      setFormData({
                        ...formData,
                        state: "",
                        district: "",
                        taluka: "",
                        city: "",
                      });
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300
                  ${
                    role === r.id
                      ? `${r.activeClass} shadow-lg`
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <r.icon className="w-4 h-4" />
                  {r.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                icon={User}
              />

              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                icon={Mail}
              />

              {/* ✅ Location Only for Contractor */}
              {role === "contractor" && (
                <div className="space-y-4">
                  {/* State */}
                  <div>
                    <label className="text-sm text-gray-300">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleLocationChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                    >
                      <option value="" className="bg-gray-900 text-gray-400">
                        Select State
                      </option>
                      {Object.keys(locationData).map((state) => (
                        <option
                          key={state}
                          value={state}
                          className="bg-gray-900 text-white"
                        >
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  {formData.state && (
                    <div>
                      <label className="text-sm text-gray-300">District</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleLocationChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        <option
                          value=""
                          className="bg-gray-900 text-gray-400"
                        >
                          Select District
                        </option>
                        {Object.keys(locationData[formData.state]).map(
                          (district) => (
                            <option
                              key={district}
                              value={district}
                              className="bg-gray-900 text-white"
                            >
                              {district}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  {/* Taluka */}
                  {formData.district && (
                    <div>
                      <label className="text-sm text-gray-300">Taluka</label>
                      <select
                        name="taluka"
                        value={formData.taluka}
                        onChange={handleLocationChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        <option
                          value=""
                          className="bg-gray-900 text-gray-400"
                        >
                          Select Taluka
                        </option>
                        {Object.keys(
                          locationData[formData.state][formData.district]
                        ).map((taluka) => (
                          <option
                            key={taluka}
                            value={taluka}
                            className="bg-gray-900 text-white"
                          >
                            {taluka}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* City */}
                  {formData.taluka && (
                    <div>
                      <label className="text-sm text-gray-300">
                        City / Village
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleLocationChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        <option
                          value=""
                          className="bg-gray-900 text-gray-400"
                        >
                          Select City/Village
                        </option>
                        {locationData[formData.state][formData.district][
                          formData.taluka
                        ].map((city) => (
                          <option
                            key={city}
                            value={city}
                            className="bg-gray-900 text-white"
                          >
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Phone */}
              <Input
                label="Phone Number (Optional)"
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
              />

              {/* Password */}
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                icon={Lock}
              />

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
                isLoading={loading}
              >
                Create Account
              </Button>

              {/* Login Link */}
              <div className="text-center mt-6 pt-4 border-t border-white/5">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    state={{ role }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
