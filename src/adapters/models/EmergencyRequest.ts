import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BloodGroup, EmergencyStatus } from "../../shared/enums";
import { User } from "./User";

@Entity("bc_emergency_requests")
export class EmergencyRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  requesterId!: string;

  @ManyToOne(() => User, { eager: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "requesterId" })
  requester!: User;

  @Column({ type: "enum", enum: BloodGroup })
  bloodGroup!: BloodGroup;

  @Column({ nullable: true, type: "text" })
  message!: string | null;

  @Column({ type: "enum", enum: EmergencyStatus, default: EmergencyStatus.OPEN })
  status!: EmergencyStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
