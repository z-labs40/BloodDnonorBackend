import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BloodGroup, DonorStatus } from "../../shared/enums";
import { User } from "./User";

@Entity("bc_donors")
export class Donor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  userId!: string;

  @ManyToOne(() => User, { eager: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "enum", enum: BloodGroup })
  bloodGroup!: BloodGroup;

  @Column()
  department!: string;

  @Column()
  year!: string;

  @Column()
  phone!: string;

  @Column()
  hostel!: string;

  @Column({ default: true })
  availability!: boolean;

  @Column({ type: "enum", enum: DonorStatus, default: DonorStatus.PENDING })
  status!: DonorStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
