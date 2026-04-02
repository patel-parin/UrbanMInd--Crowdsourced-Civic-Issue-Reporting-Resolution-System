import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Skeleton from "../../components/common/Skeleton";
import { User, Mail, Phone, MapPin, Award } from "lucide-react";
import { authService } from "../../api/services/authService";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.me();

        // ensure valid profile object
        if (data && typeof data === "object") setProfile(data);
        else setProfile(user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-2xl col-span-1" />
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // If profile STILL null (rare), avoid crash
  if (!profile)
    return (
      <div className="text-center text-gray-400 mt-10">
        Failed to load profile
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">
          Manage your account settings and view your impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PROFILE CARD */}
        <Card className="md:col-span-1 flex flex-col items-center text-center p-8">
          <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-6 border-4 border-gray-800 shadow-xl">
            <User className="w-16 h-16 text-gray-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {profile?.name || "Unknown User"}
          </h2>

          <p className="text-blue-400 font-medium capitalize mb-6">
            {profile?.role || "citizen"}
          </p>

          <div className="w-full space-y-3">
            <Button variant="secondary" className="w-full">
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Delete Account
            </Button>
          </div>
        </Card>

        {/* DETAILS */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xl font-bold text-white mb-6">
              Personal Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-800/50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-white">
                    {profile?.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-800/50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-white">
                    {profile?.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-800/50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="text-white">
                    {profile?.city || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* IMPACT SCORE */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-6">Impact Score</h3>

            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">
                    Level {profile?.citizenLevel || 1}
                  </span>
                  <span className="text-blue-400 font-bold">
                    {profile?.impactPoints || 0} Points
                  </span>
                </div>

                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${((profile?.impactPoints || 0) % 100)
                        }%`,
                    }}
                  ></div>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {100 - ((profile?.impactPoints || 0) % 100)} points to next
                  level
                </p>
              </div>

              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
