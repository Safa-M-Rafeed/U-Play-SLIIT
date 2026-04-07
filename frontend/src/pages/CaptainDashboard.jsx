import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  PlusSquareIcon,
  FolderKanbanIcon,
  EyeIcon,
  UserPlusIcon,
  CheckCircleIcon,
  TrophyIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  XCircleIcon,
  UsersIcon
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { GradientButton } from "../components/ui/GradientButton";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../lib/media";

import CreateTeam from "./CreateTeam";
import TeamDashboard from "./TeamDashboard";
import TeamDetails from "./TeamDetails";
import AddPlayerPage from "./AddPlayerPage";
import RegisterTournamentPage from "./RegisterTournamentPage";

const sidebarItems = [
  { icon: <LayoutDashboardIcon className="w-5 h-5" />, label: "Dashboard", path: "/captain" },
  { icon: <ClipboardListIcon className="w-5 h-5" />, label: "Register Tournament", path: "/captain/register" }
];

export function CaptainDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("dashboard");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const currentCaptainId =
    user?.id || user?._id || user?.email || user?.username || "";

  const refreshTeamFromServer = async () => {
    if (!currentCaptainId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/captain/${encodeURIComponent(currentCaptainId)}`
      );

      if (response.status === 404) {
        setTeams([]);
        setSelectedTeam(null);
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setTeams([data]);
      setSelectedTeam(data);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    refreshTeamFromServer();
  }, [currentCaptainId]);

  const handleQuickAction = (action) => {
    if (!selectedTeam && action !== "create") {
      alert("Create/select a team first");
      return;
    }
    setActiveView(action);
  };

  const renderContent = () => {
    switch (activeView) {
      case "create":
        return <CreateTeam addTeam={(t) => setTeams([t])} />;
      case "manage":
        return <TeamDashboard teams={teams} />;
      case "details":
        return selectedTeam && <TeamDetails team={selectedTeam} />;
      case "addPlayer":
        return selectedTeam && <AddPlayerPage team={selectedTeam} />;
      case "register":
        return selectedTeam && <RegisterTournamentPage team={selectedTeam} />;
      default:
        return <GlassCard>Welcome to Team Management</GlassCard>;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || "captain"}
      userName={user?.fullName || "Captain"}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Captain Dashboard"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          <button onClick={() => handleQuickAction("create")} className="card">
            <PlusSquareIcon /> Create Team
          </button>

          <button onClick={() => handleQuickAction("manage")} className="card">
            <FolderKanbanIcon /> Manage Team
          </button>

          <button onClick={() => handleQuickAction("details")} className="card">
            <EyeIcon /> Team Details
          </button>

          <button onClick={() => handleQuickAction("addPlayer")} className="card">
            <UserPlusIcon /> Add Player
          </button>

        </div>

        {/* Tournament Section */}
        <motion.div>
          <h3 className="text-white text-lg mb-3">Available Tournaments</h3>

          {[{ id: 1, name: "Spring Cup" }, { id: 2, name: "Regional League" }].map((t) => (
            <GlassCard key={t.id} className="flex justify-between mb-3">
              <span className="text-white">{t.name}</span>

              <GradientButton
                onClick={() => navigate(`/captain/tournaments/${t.id}`)}
              >
                Register
              </GradientButton>
            </GlassCard>
          ))}
        </motion.div>

        {/* Dynamic Content */}
        {renderContent()}

      </div>
    </DashboardLayout>
  );
}