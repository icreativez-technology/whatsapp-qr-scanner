# WhatsApp QR Scanner System

A Node.js service that captures WhatsApp Web QR codes and displays them via a Laravel frontend using real-time updates with Pusher.

## 📂 Repository Structure

- whatsapp-qr-scanner
- app/ # Laravel backend
- qr-code-service/ # Node.js QR capture service
- public/ # Laravel public dir (QR storage)
- qrcodes/ # Auto-generated QR images
- resources/ # Frontend assets
- routes/ # API endpoints


## 🚀 Installation Guide

### Prerequisites
- PHP 8.1+
- Node.js 16+
- Composer 2+
- Google Chrome (for Puppeteer)
- [Pusher account](https://dashboard.pusher.com)

### 1. Clone Repository
```bash
git clone https://github.com/icreativez-technology/whatsapp-qr-scanner.git
cd whatsapp-qr-scanner

composer install
npm install
cp .env.example .env
php artisan key:generate

Configure .env:
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=ap2  # Change if different

Node.js Service Setup
cd qr-code-service
npm install or npm update


Terminal 1 - Laravel:
php artisan serve

Terminal 2 - Node Service:
cd qr-code-service
node index.js

Access: http://localhost:8000

🔧 Configuration
Pusher Setup
Create app at Pusher Dashboard

Enable:

Client Events

Private Channels (optional)

Copy credentials to both:
chmod -R 775 storage/
chmod -R 775 public/qrcodes/
Laravel .env

qr-code-service/config.json

