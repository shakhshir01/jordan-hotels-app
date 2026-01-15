/**
 * Database Migration Service
 * Manages database schema versioning and updates
 */

/**
 * Migration Interface
 */
export class Migration {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.timestamp = new Date().toISOString();
    /** @type {any} */
    this.database = null;
  }

  async up() {
    throw new Error('up() must be implemented');
  }

  async down() {
    throw new Error('down() must be implemented');
  }
}

/**
 * Migration Runner
 */
export class MigrationRunner {
  constructor(database, migrationsPath = './migrations') {
    this.database = database;
    this.migrationsPath = migrationsPath;
    this.migrations = new Map();
    this.applied = new Set();
  }

  /**
   * Register a migration
   */
  register(migration) {
    if (this.migrations.has(migration.name)) {
      throw new Error(`Migration ${migration.name} already registered`);
    }
    this.migrations.set(migration.name, migration);
    // Link migration instances to runner's database for convenience
    try {
      migration.database = this.database;
    } catch {
      // ignore if migration is frozen
    }
  }

  /**
   * Run pending migrations
   */
  async runPending() {
    try {
      // Load applied migrations
      await this.loadAppliedMigrations();

      const pending = Array.from(this.migrations.values())
        .filter((m) => !this.applied.has(m.name))
        .sort((a, b) => a.version - b.version);

      console.log(`Found ${pending.length} pending migrations`);

      for (const migration of pending) {
        console.log(`Running migration: ${migration.name}`);
        await migration.up();
        await this.recordMigration(migration.name);
        this.applied.add(migration.name);
        console.log(`✓ Migration ${migration.name} completed`);
      }

      console.log('All migrations completed successfully');
      return pending.length;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback migrations
   */
  async rollback(steps = 1) {
    try {
      await this.loadAppliedMigrations();

      const toRollback = Array.from(this.applied)
        .map((name) => this.migrations.get(name))
        .sort((a, b) => b.version - a.version)
        .slice(0, steps);

      for (const migration of toRollback) {
        console.log(`Rolling back: ${migration.name}`);
        await migration.down();
        await this.removeMigration(migration.name);
        this.applied.delete(migration.name);
      }

      return toRollback.length;
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Load applied migrations from database
   */
  async loadAppliedMigrations() {
    try {
      // Implementation depends on database
      const migrations = await this.database.query(
        'SELECT name FROM migrations ORDER BY applied_at'
      );

      migrations.forEach((m) => {
        this.applied.add(m.name);
      });
    } catch (_error) {
      console.log('Migrations table not found, will be created');
    }
  }

  /**
   * Record migration as applied
   */
  async recordMigration(name) {
    await this.database.execute(
      `INSERT INTO migrations (name, applied_at) VALUES (?, ?)`,
      [name, new Date().toISOString()]
    );
  }

  /**
   * Remove migration record
   */
  async removeMigration(name) {
    await this.database.execute(`DELETE FROM migrations WHERE name = ?`, [name]);
  }

  /**
   * Get migration status
   */
  async getStatus() {
    await this.loadAppliedMigrations();

    return {
      total: this.migrations.size,
      applied: this.applied.size,
      pending: this.migrations.size - this.applied.size,
      migrations: Array.from(this.migrations.values()).map((m) => ({
        name: m.name,
        version: m.version,
        status: this.applied.has(m.name) ? 'applied' : 'pending',
      })),
    };
  }
}

/**
 * Example Migrations
 */

export class CreateUsersTable extends Migration {
  constructor() {
    super('001_create_users_table', 1);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS users');
  }
}

export class CreateHotelsTable extends Migration {
  constructor() {
    super('002_create_hotels_table', 2);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS hotels (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'JOD',
        rating DECIMAL(3, 2),
        reviews INT DEFAULT 0,
        image VARCHAR(500),
        phone VARCHAR(20),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_location (location),
        INDEX idx_price (price),
        INDEX idx_rating (rating)
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS hotels');
  }
}

export class CreateBookingsTable extends Migration {
  constructor() {
    super('003_create_bookings_table', 3);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        hotel_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        guests INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_user_id (user_id),
        INDEX idx_hotel_id (hotel_id),
        INDEX idx_status (status),
        INDEX idx_dates (check_in_date, check_out_date)
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS bookings');
  }
}

export class CreateReviewsTable extends Migration {
  constructor() {
    super('004_create_reviews_table', 4);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        hotel_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_hotel_id (hotel_id),
        INDEX idx_user_id (user_id),
        INDEX idx_rating (rating)
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS reviews');
  }
}

export class CreateWishlistTable extends Migration {
  constructor() {
    super('005_create_wishlist_table', 5);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS wishlist (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        hotel_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_hotel (user_id, hotel_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (hotel_id) REFERENCES hotels(id)
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS wishlist');
  }
}

export class CreatePaymentsTable extends Migration {
  constructor() {
    super('006_create_payments_table', 6);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        booking_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'JOD',
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(100),
        stripe_payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_status (status),
        INDEX idx_booking_id (booking_id),
        UNIQUE KEY unique_booking_payment (booking_id)
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS payments');
  }
}

export class CreateAmenitiesTable extends Migration {
  constructor() {
    super('007_create_amenities_table', 7);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS amenities (
        id VARCHAR(36) PRIMARY KEY,
        hotel_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id),
        INDEX idx_hotel_id (hotel_id)
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS amenities');
  }
}

export class CreateMigrationsTable extends Migration {
  constructor() {
    super('000_create_migrations_table', 0);
  }

  async up() {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.database.execute(sql);
  }

  async down() {
    await this.database.execute('DROP TABLE IF EXISTS migrations');
  }
}

export default {
  Migration,
  MigrationRunner,
  CreateMigrationsTable,
  CreateUsersTable,
  CreateHotelsTable,
  CreateBookingsTable,
  CreateReviewsTable,
  CreateWishlistTable,
  CreatePaymentsTable,
  CreateAmenitiesTable,
};
