import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config";
import { Logger } from "../shared/logger";
import { User } from "../adapters/models/User";
import { Donor } from "../adapters/models/Donor";
import { EmergencyRequest } from "../adapters/models/EmergencyRequest";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: config.db.url,
  synchronize: config.nodeEnv === "development",
  logging: config.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  entities: [User, Donor, EmergencyRequest],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      Logger.info("✅ Database connection established");
    }
  } catch (error) {
    Logger.error(`❌ Database connection failed: ${error}`);
    throw error;
  }
};
