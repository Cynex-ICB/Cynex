# MongoDB Schema Notes

This project uses MongoDB with Mongoose models instead of SQL migrations.

Schema definitions live in:

- `server/src/models/User.js`
- `server/src/models/Assessment.js`
- `server/src/models/Question.js`
- `server/src/models/AssessmentAttempt.js`
- `server/src/models/StudentAnswer.js`

Mongoose creates collections and indexes from these schemas when the API connects to MongoDB.
For production schema changes, add versioned migration scripts in this directory and run them
against the configured `MONGODB_URI`.
