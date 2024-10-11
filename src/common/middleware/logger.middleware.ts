import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { CustomRequest } from 'src/common/types/CustomRequest';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: CustomRequest, res: Response, next: () => void) {
    const startTime = Date.now();
    const { method, originalUrl, headers, body } = req;

    // Log request details
    console.log('Request Details:');
    console.log(`Method: ${method}`);
    console.log(`URL: ${originalUrl}`);
    console.log(`Headers: ${JSON.stringify(headers)}`);
    console.log(`Body: ${JSON.stringify(body)}`);
    console.log(`Time: ${new Date().toLocaleTimeString()}`);

    // Capture the response status
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`Response Status: ${res.statusCode}`);
      console.log(`Duration: ${duration}ms`);
    });

    next();
  }
}
