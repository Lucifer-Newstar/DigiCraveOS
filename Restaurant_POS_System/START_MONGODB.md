# How to Run MongoDB with Docker for the POS System

## Step 1: Start MongoDB using Docker Compose

Make sure you're in the project root:

```bash
cd /home/user/Restaurant_pos_AI/Restaurant_POS_System
```

### Option A: Using `docker compose` (Recommended)

```bash
# Start MongoDB in the background
docker compose up -d mongodb

# Check if it's running
docker compose ps

# View logs
docker compose logs -f mongodb
```

### Option B: Using plain docker run

```bash
docker run -d \
  --name pos-mongodb \
  -p 27017:27017 \
  -v pos-mongo-data:/data/db \
  mongo:7
```

## Step 2: Verify MongoDB is running

```bash
# Check if the container is up
docker ps | grep pos-mongodb

# Test connection (inside the container)
docker exec -it pos-mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

You should see something like:
```json
{ ok: 1 }
```

## Step 3: Update Backend `.env` (Already Done)

Your current `.env` is already correct:

```env
MONGODB_URI=mongodb://localhost:27017/pos-db
```

## Step 4: Restart the Backend

If the backend is currently running, restart it so it picks up the new MongoDB connection:

```bash
# If using the process tool, stop it first, then start again
# Or simply in terminal:
cd pos-backend
npm run dev
```

## Step 5: Test the Connection

You can test from the backend by adding a temporary route or just try to register a user from the frontend.

---

## Useful Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d mongodb` | Start MongoDB |
| `docker compose down` | Stop and remove containers |
| `docker compose logs -f mongodb` | View live logs |
| `docker ps` | List running containers |
| `docker exec -it pos-mongodb mongosh` | Open MongoDB shell |
| `docker volume ls` | List volumes |
| `docker volume rm pos-mongo-data` | Delete all data (careful!) |

## How to Connect from Outside (Compass, etc.)

- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `pos-db`
- No username/password (development setup)

## Switching to Authenticated MongoDB Later (Optional)

If you want to add authentication:

1. Edit `docker-compose.yml` and uncomment the environment section.
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://admin:admin123@localhost:27017/pos-db?authSource=admin
   ```
3. Restart the container:
   ```bash
   docker compose down
   docker compose up -d mongodb
   ```

---

## Troubleshooting

**"Connection refused"**
- Make sure Docker container is running: `docker ps`
- Check if port 27017 is free on your host.

**"MongoDB not found" in this sandbox**
- Docker CLI is not available in this environment.
- You must run the `docker compose` commands **on your local machine**.

**Data not persisting**
- Make sure you're using the named volume `pos-mongo-data`.

---

**Next step**: Run the commands above on **your local computer** (where Docker is installed).
