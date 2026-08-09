# 🍽️ **Restaurant POS System**  

A full-featured **Restaurant POS System** built using the **MERN Stack** to streamline restaurant operations, enhance customer experience, and manage orders, payments, and inventory with ease.

## ✨ **Features**

- 🍽️ **Order Management**  
  Efficiently manage customer orders with real-time updates and status tracking.

- 🪑 **Table Reservations**  
  Simplify table bookings and manage reservations directly from the POS.

- 🔐 **Authentication**  
  Secure login and role-based access control for admins, staff, and users.

- 💸 **Payment Integration**  
  Integrated with **Razorpay** (or other gateways) for seamless online payments.

- 🧾 **Billing & Invoicing**  
  Automatically generate detailed bills and invoices for every order.


## 🏗️ **Tech Stack**

| **Category**             | **Technology**                |
|--------------------------|-------------------------------|
| 🖥️ **Frontend**          | React.js, Redux, Tailwind CSS  |
| 🔙 **Backend**           | Node.js, Express.js           |
| 🗄️ **Database**          | MongoDB                       |
| 🔐 **Authentication**    | JWT, bcrypt                   |
| 💳 **Payment Integration**| Razorpay    |
| 📊 **State Management**   | Redux Toolkit                 |
| ⚡ **Data Fetching & Caching** | React Query            |
| 🔗 **APIs**              | RESTful APIs                   |

---
<br>

## 📺 **YouTube Playlist**

🎬 Follow the complete tutorial series on building this Restaurant POS System on YouTube:  
👉 [Watch the Playlist](https://www.youtube.com/playlist?list=PL9OdiypqS7Nk0DHnSNFIi8RgEFJCIWB6X)  

## 📁 **Assets**

- 📦 **Project Assets:** [Google Drive](https://drive.google.com/drive/folders/193N-F1jpzyfPCRCLc9wCyaxjYu2K6PC_)

---

## 📋 **Flow Chart for Project Structure**

- 🗺️ **Visualize the Project Structure:** [View Flow Chart](https://app.eraser.io/workspace/IcU1b6EHu9ZyS9JKi0aY?origin=share)

---

## 🎨 **Design Inspiration**

- 💡 **UI/UX Design Reference:** [Behance Design](https://www.behance.net/gallery/210280099/Restaurant-POS-System-Point-of-Sale-UIUX-Design)

---

## 🖼️ **Project Screenshots**

<table>
  <tr>
    <td><img src="https://res.cloudinary.com/amritrajmaurya/image/upload/v1740502772/ibjxvy5o1ikbsdebrjky.png" alt="Screenshot 1" width="300"/></td>
    <td><img src="https://res.cloudinary.com/amritrajmaurya/image/upload/v1740502773/ietao6dnw6yjsh4f71zn.png" alt="Screenshot 2" width="300"/></td>
  </tr>
  <tr>
    <td><img src="https://res.cloudinary.com/amritrajmaurya/image/upload/v1740502772/vesokdfpa1jb7ytm9abi.png" alt="Screenshot 3" width="300"/></td>
    <td><img src="https://res.cloudinary.com/amritrajmaurya/image/upload/v1740502772/setoqzhzbwbp9udpri1f.png" alt="Screenshot 4" width="300"/></td>
  </tr>
  <tr>
    <td><img src="https://res.cloudinary.com/amritrajmaurya/image/upload/v1740502772/fc4tiwzdoisqwac1j01y.png" alt="Screenshot 5" width="300"/></td>
  </tr>
</table>


---

## 🤖 **AI / ML Service (`Restaurant_POS_ML`)**

An optional Python (FastAPI) microservice adds machine-learning insights on top
of the existing MongoDB data — no schema changes required:

- 📈 **Sales forecasting** — predicts upcoming daily revenue & order volume
- 🍛 **Dish demand prediction** — expected quantities per dish for prep planning
- 🧺 **Dish recommendations** — market-basket "frequently bought together"

It reads the existing `orders` / `customers` collections directly. The Node
backend proxies it under `/api/ml/*` (auth-protected) and the React app surfaces
it in a new **"AI Insights"** tab on the Admin Dashboard.

```
React (AI Insights tab) ──/api/ml/*──► Node/Express ──► Restaurant_POS_ML (FastAPI) ──► MongoDB
```

See [`Restaurant_POS_ML/README.md`](./Restaurant_POS_ML/README.md) for setup,
seeding demo data, and the full API reference.

---

## 🧪 **Tests**

Automated tests live in [`tests/`](./tests): **Jest + Supertest** for the POS API
and **pytest** for the ML service (30 passing). Run everything with:

```bash
bash tests/run-all-tests.sh
```

See [`tests/README.md`](./tests/README.md) for details.

---

## 📚 **Docs**

- 🧾 **Phase 1 completion report:** [`docs/phase-1/PHASE-1-COMPLETION.md`](./docs/phase-1/PHASE-1-COMPLETION.md)
- 🗺️ **Architecture & 14 UML diagrams:** [`docs/digicrave-architecture/`](./docs/digicrave-architecture)
- 🐛 **Bug-fix log:** [`docs/bug-fixes/`](./docs/bug-fixes)

---

✨ Feel free to explore, contribute, and enhance the project! 🚀

💡 To contribute, please check out the **CONTRIBUTING.md** for guidelines.

⭐ If you find this project helpful, don't forget to **star** the repository! 🌟
