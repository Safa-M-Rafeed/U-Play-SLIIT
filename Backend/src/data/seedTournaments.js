import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Tournament from "../models/Tournament.js";

dotenv.config();

const tournaments = [
  {
    name: "Football Championship",
    sport: "Football",
    date: new Date("2026-05-10"),
    totalTeams: 16,
    status: "Registration Open"
  },
  {
    name: "Cricket League",
    sport: "Cricket",
    date: new Date("2026-06-15"),
    totalTeams: 12,
    status: "Upcoming"
  },
  {
    name: "Esports Tournament",
    sport: "Esports",
    date: new Date("2026-04-25"),
    totalTeams: 8,
    status: "Registration Open"
  },
  {
    name: "Basketball Cup",
    sport: "Basketball",
    date: new Date("2026-07-01"),
    totalTeams: 10,
    status: "Upcoming"
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // ❗ Optional: clear old data
    await Tournament.deleteMany();

    // ✅ Insert new tournaments
    await Tournament.insertMany(tournaments);

    console.log("✅ Tournament data seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedData();