# AUTHApi - Simple Role & Policy Based Authorization

A simple ASP.NET Core API demonstrating Role-Based and Policy-Based Authorization.

## 🚀 Quick Start

1. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

2. **Register a user:**
   ```bash
   POST /api/UserAuth/Register
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Login:**
   ```bash
   POST /api/UserAuth/Login
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

4. **Use the token:**
   ```bash
   GET /api/Example/AdminOnly
   Authorization: Bearer {your_token}
   ```

## 📁 Project Structure

```
AUTHApi/
├── Controllers/
│   ├── UserAuthController.cs    # Register, Login, Logout
│   ├── RolesController.cs       # Manage roles (Admin only)
│   └── ExampleController.cs      # Examples of authorization
├── Data/
│   ├── ApplicationUser.cs        # User model
│   └── ApplicationDbContext.cs   # Database context
├── Models/
│   ├── RegisterModel.cs          # Registration model
│   └── LoginModel.cs            # Login model
├── Services/
│   └── RoleSeeder.cs            # Auto-create roles on startup
├── Program.cs                    # Main configuration
├── AUTHORIZATION_GUIDE.md        # Detailed guide
└── README.md                     # This file
```

## 🔐 Authorization Types

### 1. Public (No Authorization)
```csharp
[HttpGet("Public")]
public IActionResult Public() { }
```

### 2. Authenticated Only
```csharp
[HttpGet("Protected")]
[Authorize]  // Any logged-in user
public IActionResult Protected() { }
```

### 3. Role-Based
```csharp
[HttpGet("Admin")]
[Authorize(Roles = "Admin")]  // Only Admin
public IActionResult Admin() { }
```

### 4. Policy-Based
```csharp
[HttpGet("Policy")]
[Authorize(Policy = "AdminOnly")]  // Uses policy from Program.cs
public IActionResult Policy() { }
```

## 📚 Documentation

- **AUTHORIZATION_GUIDE.md** - Complete guide with examples
- **Code comments** - Every file has detailed comments

## 🎯 Key Features

✅ Simple Role-Based Authorization  
✅ Policy-Based Authorization  
✅ JWT Token Authentication  
✅ Automatic Role Assignment  
✅ Role Management API  

## 📝 Available Roles

- **Admin** - Full access
- **User** - Standard access (assigned automatically on registration)

## 🔗 API Endpoints

### Authentication
- `POST /api/UserAuth/Register` - Register new user
- `POST /api/UserAuth/Login` - Login and get token
- `POST /api/UserAuth/Logout` - Logout

### Role Management (Admin Only)
- `GET /api/Roles` - Get all roles
- `POST /api/Roles/AssignRole` - Assign role to user
- `POST /api/Roles/RemoveRole` - Remove role from user
- `GET /api/Roles/UserRoles/{email}` - Get user's roles

### Examples
- `GET /api/Example/Public` - Public endpoint
- `GET /api/Example/Authenticated` - Requires auth
- `GET /api/Example/AdminOnly` - Requires Admin role
- `GET /api/Example/UserOnly` - Requires User role

## 💡 Tips

1. New users automatically get "User" role
2. Use Admin account to assign "Admin" role to others
3. JWT tokens include roles - no need to check database
4. See `ExampleController.cs` for authorization examples

For detailed documentation, see **AUTHORIZATION_GUIDE.md**


