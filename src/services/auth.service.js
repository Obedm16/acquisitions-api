import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error(`Problem in hashing the password.: ${e}`);
    throw Error('Problem in hashing the password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if ((await existingUser).length > 0)
      throw new Error(`User with ${email} or ${name} alaready exists`);
    const password_hash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });
    
    logger.info(`User ${newUser.email} created succesfully!`);

    return newUser;
  } catch (e) {
    logger.error(`Error in creating a user: ${e}`);
    throw e;
  }
};
