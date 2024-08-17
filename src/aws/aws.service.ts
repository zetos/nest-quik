import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class AwsService {
  constructor(private config: ConfigService) {}

  private readonly AWS_S3_BUCKET =
    this.config.getOrThrow<string>('AWS_S3_NAME');

  private readonly s3Client = new S3Client({
    region: this.config.getOrThrow<string>('AWS_S3_REGION'),
    // credentials: {
    //   accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
    //   secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
    // },
  });

  private readonly sesClient = new SESClient({
    region: this.config.getOrThrow<string>('AWS_S3_REGION'),
  });

  async uploadFile(
    fileName: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileKey = `${Date.now()}-${fileName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ACL: 'public-read',
      }),
    );

    return `https://${this.AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`;
  }

  async sendEmail(toAddress: string): Promise<void> {
    const fromAddress = 'cesar_manoel@hotmail.com';
    const sendEmailCommand = new SendEmailCommand({
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          toAddress,
          /* more To-email addresses */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: 'UTF-8',
            Data: '<h1>New Comment</h1>',
          },
          Text: {
            Charset: 'UTF-8',
            Data: 'New comment in your post.',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'EMAIL_SUBJECT',
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        /* more items */
      ],
    });

    // Note: SES is on sandbox mode !!! Only verified emails can send/receive emails.
    await this.sesClient.send(sendEmailCommand).catch((err) => {
      console.error('SES ERROR:', err);
    });
  }
}
