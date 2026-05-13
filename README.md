# blog-window

REST API for the Thought Windows blog application. Built with Express 5 and PostgreSQL via Prisma 7.

---

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Prisma 7 (`@prisma/adapter-pg`)
- **Auth**: JWT (`jsonwebtoken`), `bcryptjs`
- **Middleware**: `cors`, `express-rate-limit`, `express-validator`

---

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://<user>@<host>:<port>/<dbname>?schema=public"
PORT=3000
JWT_SECRET=<your_secret_key>
```

3. Run database migrations:

```bash
npx prisma migrate deploy
```

4. Generate the Prisma client:

```bash
npx prisma generate
```

5. Start the server:

```bash
node app.js
```

The API will be available at `http://localhost:3000`.

---

## Database Schema

### User

| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment PK |
| `email` | String | Unique |
| `password` | String | bcrypt hashed |
| `name` | String? | Optional |
| `screenname` | String? | Optional display name |
| `usertype` | Enum | `reader` (default) or `author` |

### Post

| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment PK |
| `title` | String | |
| `postbody` | String | |
| `posttime` | DateTime | Default: now |
| `authorID` | Int | FK → User |
| `published` | Boolean | Default: false |

### Comment

| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment PK |
| `commentbody` | String | |
| `authorID` | Int? | Nullable FK → User |
| `postID` | Int | FK → Post |
| `commenttime` | DateTime | Default: now |

### Reply

| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment PK |
| `replybody` | String | |
| `authorID` | Int? | Nullable FK → User |
| `commentID` | Int | FK → Comment (cascade delete) |
| `replytime` | DateTime | Default: now |

---

## API Endpoints

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/users/create` | — | Register a new user |
| `POST` | `/users/login` | — | Login and receive a JWT |
| `PATCH` | `/users/profile` | Token | Update the authenticated user's profile |

> `/users/create` and `/users/profile` are rate-limited to 10 requests per 15-minute window.

### Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/posts/` | — | Get all published posts |
| `GET` | `/posts/:postID` | — | Get a single published post |
| `GET` | `/posts/allPosts` | Token + Author | Get all posts including drafts |
| `GET` | `/posts/allPosts/:postID` | Token + Author | Get a single post including drafts |
| `POST` | `/posts/` | Token + Author | Create a new post |
| `PATCH` | `/posts/:postID` | Token + Author | Update a post |
| `DELETE` | `/posts/:postID` | Token + Author | Delete a post |

### Comments

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/posts/:postID/comments` | — | Get all comments on a post |
| `POST` | `/posts/:postID/comments` | Token | Add a comment |
| `PATCH` | `/posts/:postID/comments/:commentID` | Token (owner) | Edit a comment |
| `DELETE` | `/posts/:postID/comments/:commentID` | Token (owner or author) | Delete a comment |

### Replies

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/posts/:postID/:commentID/replies` | — | Get all replies to a comment |
| `POST` | `/posts/:postID/:commentID/replies` | Token | Add a reply |
| `PATCH` | `/posts/:postID/:commentID/replies/:replyID` | Token (owner) | Edit a reply |
| `DELETE` | `/posts/:postID/:commentID/replies/:replyID` | Token (owner or comment author) | Delete a reply |

---

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued on login, expire after **7 days**, and carry this payload:

```json
{
  "tokenUser": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane",
    "screenname": "jane_writes",
    "usertype": "author"
  }
}
```

### Middleware

- **verifyToken** (`middleware/verifyToken.js`) — validates the JWT; returns `401` if missing, `403` if invalid; attaches decoded user to `req.user`
- **verifyAuthor** (`middleware/verifyAuthor.js`) — checks `req.user.usertype === "author"`; returns `401` otherwise
