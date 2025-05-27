# PayPop Project

## Overview
PayPop is a comprehensive application designed to facilitate payment processing and management using the PayPal API. It includes functionalities for order management, invoice handling, and webhook processing.

## Project Structure
The project is organized into several key directories:

- **bot/**: Contains the bot logic and commands for managing orders and invoices.
  - **commands/**: Modular command files for various operations.
  
- **paypal/**: Contains the REST client and flow management for interacting with the PayPal API.
  - **flows/**: Specific functionalities related to invoices, subscriptions, and transactions.

- **db/**: Manages database connections and CRUD operations for orders and invoices.

- **webhook/**: Handles incoming webhook events from PayPal.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd paypop
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration
Create a `.env` file in the root directory and add your environment variables, such as API keys and database connection strings.

## Usage
To start the application, run:
```
node index.js
```

## Commands
The bot supports various commands for managing orders and invoices. Refer to the documentation in the `bot/commands/README.md` file for detailed usage instructions.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.