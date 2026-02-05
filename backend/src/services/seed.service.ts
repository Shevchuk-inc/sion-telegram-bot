import { Admin } from '../models';
import { config } from '../config';

export const seedAdmin = async (): Promise<void> => {
  const existingAdmin = await Admin.findOne({ username: config.admin.username });

  if (!existingAdmin) {
    await Admin.create({
      username: config.admin.username,
      password: config.admin.password,
    });
    console.log('Default admin created');
  }
};
