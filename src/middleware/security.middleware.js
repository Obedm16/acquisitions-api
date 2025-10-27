import aj from '#config/arcjet.js';
import { slidingWindow } from 'arcjet';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceed(20 per min). Try later';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit exceed(10 per min). Try later';
        break;
      case 'guest':
        limit = 5;
        message = 'Guest request limit exceed(5 per min). Try later';
        break;
      // default:
      //   limit = 5
      //   message = 'Request limit exceed';
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.isBot()) {
      logger.warn('Bot request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield Blocked request', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Shield Blocked request', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests not allowed',
      });
    }

    next();
  } catch (e) {
    console.error('Arcjet middleware error:', e);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    });

    // next(e);
  }
};

// const roleLimits = {
//   admin: { limit: 20, message: 'Admin request limit exceeded (20/min)' },
//   user: { limit: 10, message: 'User request limit exceeded (10/min)' },
//   guest: { limit: 5, message: 'Guest request limit exceeded (5/min)' },
// };

// const securityMiddleware = async (req, res, next) => {
//   try {
//     const role = req.user?.role || 'guest';
//     const { limit, message } = roleLimits[role] || roleLimits.guest;

//     const client = aj.withRule(
//       slidingWindow({
//         mode: 'LIVE',
//         interval: '1m',
//         max: limit,
//         name: `${role}-rate-limit`,
//       })
//     );

//     const decision = await client.protect(req);

//     if (decision.isDenied()) {
//       const reason = decision.reason;
//       let responseMessage = message;
//       const statusCode = 429;

//       if (reason.isBot()) responseMessage = 'Automated bot requests are not allowed';
//       else if (reason.isShield()) responseMessage = 'Suspicious request blocked';
//       else if (reason.isRateLimit()) responseMessage = message;

//       logger.warn('Request denied', {
//         role,
//         ip: req.ip,
//         path: req.originalUrl,
//         method: req.method,
//         userAgent: req.get('User-Agent'),
//         reason: reason.type || 'unknown',
//       });

//       return res.status(statusCode).json({
//         error: 'Too Many Requests',
//         message: responseMessage,
//       });
//     }

//     next();
//   } catch (e) {
//     console.error('Arcjet middleware error:', e);
//     res.status(500).json({
//       error: 'Internal Server Error',
//       message: 'Something went wrong with security middleware',
//     });
//   }
// };


export default securityMiddleware;
