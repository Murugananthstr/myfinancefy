import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Seed data for the application.
 * This script populates the Firestore database with default data.
 * 
 * Collections created:
 * - app_config: Stores global app configuration like navigation menus.
 * - roles: Default user roles (Admin, User).
 * - settings: Default global settings.
 */

const NAVIGATION_MENU = [
  {
    title: 'Dashboard',
    icon: 'DashboardIcon',
    path: '/'
  },
  {
    title: 'Reports',
    icon: 'BarChartIcon',
    children: [
      { title: 'Sales', path: '/reports/sales' },
      { title: 'Traffic', path: '/reports/traffic' }
    ]
  },
  {
    title: 'Management',
    icon: 'PeopleIcon',
    children: [
      { title: 'Users', path: '/management/users' },
      { title: 'Roles', path: '/management/roles' }
    ]
  },
  {
    title: 'Settings',
    icon: 'SettingsIcon',
    path: '/settings'
  }
];

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Administrator',
    permissions: ['read', 'write', 'delete', 'manage_users']
  },
  {
    id: 'user',
    name: 'Standard User',
    permissions: ['read']
  }
];

const GLOBAL_SETTINGS = {
  theme: {
    mode: 'system', // 'light' | 'dark' | 'system'
    primaryColor: '#1976d2',
  },
  general: {
    appName: 'Navigation App',
    language: 'en-US'
  }
};

export const seedDatabase = async () => {
  console.log("🌱 Starting database seed...");

  try {
    const batch = writeBatch(db);

    // 1. Seed Navigation
    // We store the menu structure in a single document for easy retrieval
    const navRef = doc(db, "app_config", "navigation");
    batch.set(navRef, { items: NAVIGATION_MENU, updatedAt: new Date() });
    console.log("Prepared: Navigation menu");

    // 2. Seed Roles
    DEFAULT_ROLES.forEach(role => {
      const roleRef = doc(db, "roles", role.id);
      batch.set(roleRef, role);
    });
    console.log(`Prepared: ${DEFAULT_ROLES.length} roles`);

    // 3. Seed Global Settings
    const settingsRef = doc(db, "settings", "global");
    batch.set(settingsRef, GLOBAL_SETTINGS);
    console.log("Prepared: Global settings");

    // Commit the batch
    await batch.commit();
    
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// If running directly in a browser context where this is the entry point (unlikely but possible)
// you might want to uncomment the line below, but usually, you call this function from a UI button.
// seedDatabase();
