import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';
import { formaValidationError } from '#utils/format.js';
import { signupSchema } from '#validations/auth.validation.js';
import { cookies } from '#utils/cookies.js';

export const signUp = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formaValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = { id: user.id, email: user.email, role: user.role };

    cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${email}`);

    res.status(200).json({
      message: 'User registered',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('signup error', e);

    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exixst' });
    }

    next(e);
  }
};
