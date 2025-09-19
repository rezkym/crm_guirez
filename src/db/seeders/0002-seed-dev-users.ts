import AppDataSource from "../../data/typeorm-data-source";
import * as bcrypt from "bcrypt";

function hashPassword(password: string): string {
  // Gunakan bcrypt untuk seeder development (synchronous untuk simplicity)
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  const hash = bcrypt.hashSync(password, rounds);

  // Return bcrypt hash langsung (no salt:hash format)
  return hash;
}

export async function seedDevUsers() {
  const queryRunner = AppDataSource.createQueryRunner();

  const users = [
    // Internal (dibuat/di-manage oleh superadmin)
    {
      email: "admin@example.com",
      name: "Super Administrator",
      password: hashPassword("admin123"),
      status: "active",
    },
    {
      email: "internal.admin@example.com",
      name: "Internal Admin",
      password: hashPassword("admin123"),
      status: "active",
    },

    // Eksternal (client/hotel)
    {
      email: "owner@example.com",
      name: "Hotel Owner",
      password: hashPassword("owner123"),
      status: "active",
    },
    {
      email: "manager@example.com",
      name: "Hotel Manager",
      password: hashPassword("manager123"),
      status: "active",
    },
    {
      email: "marketing@example.com",
      name: "Hotel Marketing",
      password: hashPassword("marketing123"),
      status: "active",
    },
    {
      email: "user@example.com",
      name: "Regular User",
      password: hashPassword("user123"),
      status: "active",
    },
  ];

  try {
    // Clear existing data dengan urutan yang benar untuk menghindari FK constraints
    console.log("🧹 Menghapus data yang berkaitan dengan users...");
    await queryRunner.query("DELETE FROM model_has_roles");
    await queryRunner.query("DELETE FROM model_has_permissions");
    await queryRunner.query("DELETE FROM hotel_users");
    await queryRunner.query("DELETE FROM hotels");
    await queryRunner.query("DELETE FROM auth_tokens");
    await queryRunner.query("DELETE FROM auth_sessions");
    await queryRunner.query("DELETE FROM users");

    // Insert new users
    for (const user of users) {
      await queryRunner.query(
        "INSERT INTO users (email, name, password, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
        [user.email, user.name, user.password, user.status]
      );
    }

    console.log(`✅ ${users.length} dev users berhasil di-seed`);
  } catch (error) {
    console.error("❌ Error seeding dev users:", error);
    throw error;
  }
}
