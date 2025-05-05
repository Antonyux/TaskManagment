# User Task Management System  

A simple and efficient **User Task Management System** built with **Express.js** and **MySQL**, designed to manage user database and tasks of an organisation.  

## 📌 Features  
- User authentication (JWT-based)  
- Role-based access control (Admin & User)  
- Secure password management  
- Email and Phone Number verification  
- CRUD operations for users 
- Task Managment

## 🛠️ Technologies Used  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL  
- **Authentication:** JWT (JSON Web Token)  
- **Environment Management:** dotenv  

## 📄 Environment Variables (`.env`)  

Before running the application, configure the following environment variables in a `.env` file:  

```ini
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_DIALECT=mysql

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_TOKEN_EXPIRATION=30d

# Cookie Configuration
COOKIE_EXPIRATION=2592000000  # 30 days in milliseconds

# Base URL
BASE_URL=http://localhost:5000

# Email Verification Secret
EMAIL_SECRET=your_email_secret_key

# Admin Credentials (for initial setup)
ADMIN_PHONENO=+911234567890
ADMIN_EMAIL=admin@mail.com
ADMIN_PASS=1234567890

# Environment
NODE_ENV=development
```  

## 🚀 Getting Started  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```  

### 2️⃣ Install Dependencies  
```bash
npm install
```  

### 3️⃣ Configure Database  
- Ensure MySQL is installed and running.  
- Create a database and update `.env` variables accordingly.  

### 4️⃣  Start the Server  
```bash
npm run dev
```  
 [this runs => nodemon app.js (so needs nodemon package installed to use this command.)]
---

## 📜 API Endpoints  

### 🔐 Authentication Routes (`/api/auth/`)  
| Method  | Endpoint                | Description |
|---------|-------------------------|-------------|
| **POST**  | `/api/auth/register`     | Register a new user |
| **POST**  | `/api/auth/verifySMS`    | Verify user via SMS-OTP after /sendES |
| **POST**  | `/api/auth/verifyEmail`  | Verify user via email-token after /sendES |
| **POST**  | `/api/auth/login`        | Login user with email and password and initiating Two-Factor Authentication (2FA) |
| **POST**  | `/api/auth/TFAverifySMS` | Verify 2FA via SMS-OTP after /TFAsendES and log in (sends a cookie) |
| **POST**  | `/api/auth/TFAverifyEmail` | Verify 2FA via email-token after /TFAsendES and log in (sends a cookie) |
| **POST**  | `/api/auth/sendES`       | Send email/SMS to verify after registration or adding of new user |
| **POST**  | `/api/auth/TFAsendES`    | Send email/SMS for TFA verification |


#### 🔹 **Register a User**  
**Endpoint:** `POST /api/auth/register`  
**Description:** Registers a new user and hashes their password before storing it in the database.  
**Request Body:**  
```json
{
  "companyId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "phoneNumber": "+911234567890",
  "password": "hashedpassword",
  "dob": "1990-01-01"
}
```
**Response:**  
```json
{
  "message": "User registered successfully! Next please verify via Email or SMS or both.",
  "user": { "id": 1, "firstName": "John", "lastName": "Doe", "email": "johndoe@example.com", "phoneNumber": "+911234567890" }
}
```


---

### 👤 User Routes (`/api/user/`)  
| Method  | Endpoint                     | Description |
|---------|------------------------------|-------------|
| **PUT**  | `/api/user/profile/update`   | Update logged-in user's profile |
| **POST**  | `/api/user/logout`          | Logout user |



#### 🔹 **Update User Profile**  
**Endpoint:** `PUT /api/user/profile/update`  
**Authorization:** Cookie Token (JWT)  
**Description:** Allows an authenticated user to update their profile information.  
**Request Body:** *(All fields are optional)*  
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "phoneNumber": "+911234567890",
  "password": "newpassword",
  "dob": "1990-01-01"
}
```
**Response:**  
```json
{
  "message": "Profile updated successfully",
  "user": { "id": 1, "firstName": "John", "lastName": "Doe", "email": "newemail@example.com", "phoneNumber": "+911234567890" }
}
```

---



### 🛠️ Admin Routes (`/api/user/admin/`)  
| Method  | Endpoint               | Description |
|---------|------------------------|-------------|
| **POST**  | `/api/user/admin/create`  | Create a new user (Admin only) |
| **GET**   | `/api/user/admin/`        | Get all users (Admin only) |
| **GET**   | `/api/user/admin/:id`     | Get a specific user by ID (Admin only) |
| **PUT**   | `/api/user/admin/:id`     | Update a user by ID (Admin only) |
| **DELETE**| `/api/user/admin/:id`     | Delete a user by ID (Admin only) |

---


#### 🔹 **Create a New User (Admin Only)**  
**Endpoint:** `POST /api/user/admin/create`  
**Authorization:** Cookie Token (JWT) + Admin Privileges  
**Description:** Allows an admin to create a new user.  
**Request Body:**  
```json
{
  "companyId": 1,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "janesmith@example.com",
  "phoneNumber": "+919876543210",
  "password": "hashedpassword",
  "roleId": 2,
  "dob": "1992-05-10"
}
```
**Response:**  
```json
{
  "message": "User registered successfully! Next please verify via Email or SMS or both.",
  "user": { "id": 2, "firstName": "Jane", "lastName": "Smith", "email": "janesmith@example.com", "phoneNumber": "+919876543210" }
}
```

#### 🔹 **Get All Users (Admin Only)**  
**Endpoint:** `GET /api/user/admin/`  
**Authorization:** Cookie Token (JWT) + Admin Privileges  
**Response:**  
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "phoneNumber": "+911234567890",
    "status": "active",
    ...
    ...
  },
  {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "janesmith@example.com",
    "phoneNumber": "+919876543210",
    "status": "inactive",
    ...
    ...
  }
]
```

#### 🔹 **Delete a User (Admin Only)**  
**Endpoint:** `DELETE /api/user/admin/:id`  
**Authorization:** Cookie Token (JWT) + Admin Privileges  
**Response:**  
```json
{
  "message": "User deleted successfully",
  "user": { "id": 2, "email": "janesmith@example.com" }
}
```

---

## 🔑 **Authentication & Security**  

- **JWT-based authentication** (`Cookie based auth`)
- **Two-Factor Authentication (2FA)**
- **Role-based access control for admins**
- **Password hashing with bcrypt**
- **Account verification via email/SMS OTP**

---
