/*
Table: messages
Columns:
- id (Primary Key)
- thread_id (Foreign Key -> message_threads.id)
- sender_id (Foreign Key -> users.id)
- message_text
- created_at
*/
