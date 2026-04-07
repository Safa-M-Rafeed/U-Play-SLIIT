import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  PlusSquareIcon,
  FolderKanbanIcon,
  EyeIcon,
  UserPlusIcon
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../lib/media";

import CreateTeam from "./CreateTeam";
import TeamDashboard from "./TeamDashboard";
import TeamDetails from "./TeamDetails";
import AddPlayerPage from "./AddPlayerPage";
import RegisterTournamentPage from "./RegisterTournamentPage";

const sidebarItems = [
  {
    icon: <LayoutDashboardIcon className="w-5 h-5" />,
    label: "Dashboard",
    path: "/captain"
  },
  {
    icon: <ClipboardListIcon className="w-5 h-5" />,
    label: "Register Tournament",
    path: "/captain/register"
  }
];

export function CaptainDashboard() {
  const { user } = useAuth();

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

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch team");
      }

      setTeams([data]);
      setSelectedTeam((prev) => {
        if (!prev) return data;
        return prev._id === data._id || prev.id === data._id ? data : prev;
      });
    } catch (error) {
      console.error("Error fetching captain team:", error.message);
    }
  };

  useEffect(() => {
    refreshTeamFromServer();
  }, [currentCaptainId]);

  const captainTeams = teams;

  const handleAddTeam = (team) => {
    setTeams([team]);
    setSelectedTeam(team);
    setActiveView("create");
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setActiveView("details");
  };

  const handleUpdateTeam = async (updatedTeam, stayOnCurrentView = false) => {
    setTeams([updatedTeam]);
    setSelectedTeam(updatedTeam);

    if (!stayOnCurrentView) {
      setActiveView("details");
    }

    await refreshTeamFromServer();
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete team");
      }

      setTeams([]);
      setSelectedTeam(null);
      setActiveView("manage");
      alert("Team deleted successfully ✅");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleQuickAction = (actionKey) => {
    if (actionKey === "create") {
      setActiveView("create");
      return;
    }

    if (captainTeams.length === 0) {
      alert("Please create a team first");
      return;
    }

    const currentTeam = selectedTeam || captainTeams[0];
    setSelectedTeam(currentTeam);

    if (actionKey === "manage") {
      setActiveView("manage");
      return;
    }

    if (actionKey === "details") {
      setActiveView("details");
      return;
    }

    if (actionKey === "addPlayer") {
      setActiveView("addPlayer");
      return;
    }

    if (actionKey === "register") {
      setActiveView("register");
    }
  };

  const renderContent = () => {
    if (activeView === "create") {
      return <CreateTeam addTeam={handleAddTeam} />;
    }

    if (activeView === "manage") {
      return (
        <TeamDashboard
          teams={captainTeams}
          onSelectTeam={handleSelectTeam}
          onUpdateTeam={handleUpdateTeam}
          onDeleteTeam={handleDeleteTeam}
        />
      );
    }

    if (activeView === "details") {
      if (!selectedTeam) {
        return (
          <div className="text-center text-slate-300 mt-10">
            Please select your team from Manage Team.
          </div>
        );
      }

      return (
        <TeamDetails
          team={selectedTeam}
          onBack={() => setActiveView("manage")}
          onUpdateTeam={handleUpdateTeam}
        />
      );
    }

    if (activeView === "addPlayer") {
      if (!selectedTeam) {
        return (
          <div className="text-center text-slate-300 mt-10">
            Please select your team first.
          </div>
        );
      }

      return (
        <AddPlayerPage
          team={selectedTeam}
          onBack={() => setActiveView("details")}
          onUpdateTeam={handleUpdateTeam}
        />
      );
    }

    if (activeView === "register") {
      if (!selectedTeam) {
        return (
          <div className="text-center text-slate-300 mt-10">
            Please select your team first.
          </div>
        );
      }

      return <RegisterTournamentPage team={selectedTeam} />;
    }

    return (
      <GlassCard>
        <div className="text-slate-300">
          <p className="text-lg font-semibold text-white mb-2">
            Welcome to Team Management
          </p>
          <p>
            Use the action cards above to create your team, manage your team,
            view team details, add players, and use the sidebar to register for
            tournaments.
          </p>
        </div>
      </GlassCard>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || "captain"}
      userName={user?.fullName || user?.name || "Captain"}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Captain Dashboard"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <button
            onClick={() => handleQuickAction("create")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-blue-400 mb-4">
              <PlusSquareIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Create Team</h3>
          </button>

          <button
            onClick={() => handleQuickAction("manage")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-purple-400 mb-4">
              <FolderKanbanIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Manage Team</h3>
          </button>

          <button
            onClick={() => handleQuickAction("details")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-green-400 mb-4">
              <EyeIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Team Details</h3>
          </button>

          <button
            onClick={() => handleQuickAction("addPlayer")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-amber-400 mb-4">
              <UserPlusIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Add Player</h3>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}