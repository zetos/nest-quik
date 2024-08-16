<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# NestJS POC Project

This is a project using NestJS. The project demonstrates basic functionalities such as authentication, creating users, posts, and comments, while incorporating various features like Prisma ORM, custom error handling, and comprehensive testing.

## Stack

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications. NestJS leverages TypeScript, making it easier to build robust and maintainable applications with a modular architecture.

- **Prisma ORM**: Used for database operations, providing a type-safe and intuitive interface for querying and manipulating data. Prisma accelerates development and ensures safety by preventing common database-related errors.

- **Authentication with Passport**: Implements JWT-based authentication, managing both `access-token` and `refresh-token` for secure user sessions. Passport is a popular middleware that simplifies authentication processes in Node.js applications.

- **Image Upload with AWS S3**: Utilizes AWS S3 for scalable and reliable image storage. This setup ensures high availability and durability, making it suitable for handling large volumes of image data.

- **Email using AWS SES**: Employs AWS Simple Email Service (SES) for sending emails, currently in sandbox mode for testing and development. SES is a cost-effective and scalable solution for handling email communication, crucial for features like user verification and notifications.

- **Error Handling with `HttpException`**: Centralizes error handling to provide consistent and informative error responses. This approach improves debugging and user experience by offering clear feedback when issues arise.

- **Swagger for API Documentation**: Provides a user-friendly interface for API documentation and testing, hosted on `/api`. Swagger enhances collaboration by making the API easy to understand and integrate with.

- **CI with GitHub Actions**: Configured to run automated tests, linting, and builds on every push, ensuring the codebase remains stable and issues are caught early in the development process.

- **Testing with Jest and Pactum**: Uses Jest for unit and integration testing, ensuring individual components work as expected. Pactum handles end-to-end (E2E) testing, simulating real-world scenarios to validate the overall functionality of the application.

- **Serverless Deployment with AWS Lambda**: Designed to be deployed using the Serverless framework, allowing the application to run as an AWS Lambda function. This deployment model reduces costs and improves scalability by only consuming resources when necessary.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Testing](#testing)
- [Error Handling](#error-handling)

## Requirements

To run this project, you'll need the following:

> **Note**: If you're looking for a quick overview, check out the Swagger documentation for the [live version](https://5pjqiyp0hl.execute-api.us-east-1.amazonaws.com/api).

- Node.js
- PNPM (npm can be used for most scripts)
- PostgreSQL (can be set up with `docker compose up`)
- A `.env` file with appropriate environment variables (see `example.env` for reference)
- AWS credentials

**Optional**:

- Docker
- [Serverless Framework](https://www.serverless.com/)

## Installation

To get started with the project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/zetos/nest-quik.git
   cd nest-quik
   ```

2. Install the dependencies:

   ```bash
   pnpm install
   ```

3. Set up the environment variables (e.g., database connection details) in a `.env` file. Refer to `example.env` for guidance.

4. Generate the Prisma client:

   ```bash
   pnpm run prisma:generate
   ```

5. Run the database migrations:

   ```bash
   pnpm run prisma:deploy
   ```

6. Start the development server:

   ```bash
   pnpm run start:dev
   ```

## Testing

The project includes various tests to ensure functionality and reliability:

- **Unit Tests**: For testing individual pure functions located in the `util` directory.
- **End-to-End (E2E) Tests**: Simulates real-world scenarios, with third-party API calls mocked to isolate tests from external dependencies.

After completing the [Installation steps](#installation), you can run the tests with the following commands:

> **Note**: You can view the test run results on the [GitHub Actions page](https://github.com/zetos/nest-quik/actions).

```bash
pnpm run test
pnpm run test:e2e # Ensure the database is running
```

## Error Handling

The project uses the `HttpException` class for consistent error handling across the application. Errors are returned with appropriate HTTP status codes and messages, aiding in debugging and improving user feedback. This is implemented by manually throwing `HttpException`, using `class-validator` for input validation, and a custom filter that transforms Prisma exceptions into the `HttpException` format.
