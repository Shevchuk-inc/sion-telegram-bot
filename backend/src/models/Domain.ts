import mongoose, { Document, Schema } from 'mongoose';

export interface IDomain extends Document {
  name: string;
  zoneId: string;
  nameServers: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new Schema<IDomain>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    zoneId: {
      type: String,
      required: true,
    },
    nameServers: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Domain = mongoose.model<IDomain>('Domain', DomainSchema);
