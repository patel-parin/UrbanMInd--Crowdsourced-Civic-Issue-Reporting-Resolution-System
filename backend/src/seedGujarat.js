
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Issue from "./models/Issue.js";
import Assignment from "./models/Assignment.js";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const cities = [
    // Major Cities
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar",

    // Large & Mid-size Cities
    "Anand", "Nadiad", "Morbi", "Mehsana", "Surendranagar", "Bharuch", "Navsari",
    "Vapi", "Valsad", "Godhra", "Bhuj", "Palanpur", "Patan", "Dahod",
    "Porbandar", "Veraval", "Gondal", "Jetpur", "Amreli", "Deesa",
    "Botad", "Kalol", "Ankleshwar",

    // Saurashtra Region
    "Somnath", "Dwarka", "Mangrol", "Kodinar", "Una", "Talala",
    "Dhrol", "Dhoraji", "Jasdan", "Upleta", "Wankaner",
    "Maliya Hatina", "Lathi", "Savarkundla", "Rajula", "Palitana",
    "Sihor", "Mahuva", "Gariadhar", "Babra",

    // Kutch Region
    "Anjar", "Mandvi", "Mundra", "Bhachau", "Rapar",
    "Nakhatrana", "Gandhidham",

    // North Gujarat
    "Unjha", "Visnagar", "Siddhpur", "Vadnagar", "Kadi",
    "Himmatnagar", "Modasa", "Idar", "Dehgam", "Chanasma",
    "Tharad", "Dhanera", "Radhanpur",

    // Central Gujarat
    "Khambhat", "Petlad", "Borsad", "Karjan",
    "Dabhoi", "Halol", "Kalol (Panchmahal)",
    "Padra", "Umreth", "Lunawada",

    // South Gujarat
    "Vyara", "Bardoli", "Songadh", "Mandvi (Surat)",
    "Chikhli", "Bilimora", "Pardi",
    "Umbergaon", "Dharampur", "Ahwa",

    // Other Important Towns
    "Keshod", "Limbdi", "Sanand", "Dholka",
    "Matar", "Talod", "Kapadvanj", "Balasinor",
    "Vijapur", "Prantij", "Bayad", "Jambusar",
    "Tilakwada", "Rajpipla", "Wadhwan"
];

const seedGujarat = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // Optional: Clear existing data?
        // console.log("Clearing existing users (except superadmin)...");
        // await User.deleteMany({ role: { $ne: 'superadmin' } });
        // await Issue.deleteMany({});
        // await Assignment.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("123456", salt);

        for (const city of cities) {
            console.log(`Seeding data for ${city}...`);

            // 1. Create City Admin
            const adminEmail = `admin.${city.toLowerCase()}@urbanmind.com`;
            const adminExists = await User.findOne({ email: adminEmail });

            if (!adminExists) {
                await User.create({
                    name: `${city} Admin`,
                    email: adminEmail,
                    password: passwordHash,
                    role: "admin",
                    city: city,
                    state: "Gujarat",
                    district: city,
                    taluka: city
                });
                console.log(` - Created Admin: ${adminEmail}`);
            } else {
                console.log(` - Admin already exists: ${adminEmail}`);
            }

            // 2. Create 5 Contractors
            for (let i = 1; i <= 5; i++) {
                const contractorEmail = `contractor${i}.${city.toLowerCase()}@urbanmind.com`;
                const contractorExists = await User.findOne({ email: contractorEmail });

                if (!contractorExists) {
                    await User.create({
                        name: `${city} Contractor ${i}`,
                        email: contractorEmail,
                        password: passwordHash,
                        role: "contractor",
                        city: city,
                        state: "Gujarat",
                        district: city,
                        taluka: city,
                        companyName: `${city} Construction Co ${i}`,
                        rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
                        completedTasks: Math.floor(Math.random() * 50),
                        efficiency: Math.floor(Math.random() * (100 - 80) + 80),
                        costPerTask: Math.floor(Math.random() * (5000 - 1000) + 1000)
                    });
                    console.log(` - Created Contractor: ${contractorEmail}`);
                }
            }

            // 3. Create a Citizen
            const citizenEmail = `citizen.${city.toLowerCase()}@urbanmind.com`;
            const citizenExists = await User.findOne({ email: citizenEmail });

            if (!citizenExists) {
                await User.create({
                    name: `${city} Citizen`,
                    email: citizenEmail,
                    password: passwordHash,
                    role: "citizen",
                    city: city,
                    state: "Gujarat",
                    district: city,
                    taluka: city,
                    impactPoints: Math.floor(Math.random() * 100)
                });
                console.log(` - Created Citizen: ${citizenEmail}`);
            }
        }

        console.log("Seeding Complete!");
        process.exit();
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedGujarat();
