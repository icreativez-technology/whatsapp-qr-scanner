const puppeteer = require('puppeteer');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const config = {
  port: 3000,
  apiEndpoint: 'http://localhost:8000/api/qr-upload',
  deleteEndpoint: 'http://localhost:8000/api/qr-delete',
  whatsappUrl: 'https://web.whatsapp.com',
  qrRefreshInterval: 30000,
  maxWaitTime: 300000,
  navigationTimeout: 120000
};

let browserInstance;
let pageInstance;
let isServiceActive = false;
let qrRefreshInterval;
let currentQRUrl = null;

async function initializeQRService() {
  if (isServiceActive) return;
  isServiceActive = true;

  try {
    browserInstance = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    pageInstance = await browserInstance.newPage();
    await pageInstance.setDefaultNavigationTimeout(config.navigationTimeout);
    await pageInstance.setViewport({ width: 1280, height: 800 });

    await pageInstance.goto(config.whatsappUrl, {
      waitUntil: 'domcontentloaded',
      timeout: config.navigationTimeout
    });

    // Start QR code refresh cycle
    await startQRRefreshCycle();

    await verifyUserLogin();
    console.log('WhatsApp Web is ready for use');
  } catch (error) {
    console.error('Service error:', error.message);
    await terminateService();
  }
}

async function startQRRefreshCycle() {
  // Initial QR code generation
  await generateNewQRCode();

  // Set interval for refreshing QR code
  qrRefreshInterval = setInterval(async () => {
    if (!await checkIfLoggedIn()) {
      await generateNewQRCode();
    } else {
      clearInterval(qrRefreshInterval);
    }
  }, config.qrRefreshInterval);
}

async function generateNewQRCode() {
  try {
    console.log('Generating new QR code...');

    // Delete previous QR code if exists
    if (currentQRUrl) {
      await deleteQRCode(currentQRUrl);
    }

    await pageInstance.reload({ waitUntil: 'domcontentloaded' });
    await pageInstance.waitForSelector('canvas', { visible: true, timeout: 30000 });

    const qrCodeElement = await pageInstance.$('canvas');
    const qrCodeImage = await qrCodeElement.screenshot();
    currentQRUrl = await uploadQRCode(qrCodeImage);

    console.log('New QR code generated:', currentQRUrl);
  } catch (error) {
    console.error('QR code generation failed:', error.message);
  }
}

async function deleteQRCode(qrUrl) {
  try {
    await axios.post(config.deleteEndpoint, { qr_url: qrUrl });
    console.log('Old QR code deleted:', qrUrl);
  } catch (error) {
    console.error('Failed to delete QR code:', error.message);
  }
}

async function uploadQRCode(imageBuffer) {
  try {
    const response = await axios.post(
      config.apiEndpoint,
      { image: imageBuffer.toString('base64') },
      { timeout: 30000 }
    );
    return response.data.url;
  } catch (error) {
    throw error;
  }
}

async function checkIfLoggedIn() {
  try {
    const pageTitle = await pageInstance.title();
    return !pageTitle.includes('WhatsApp');
  } catch (error) {
    return false;
  }
}

async function verifyUserLogin() {
  const startTime = Date.now();
  console.log('Waiting for user login...');

  while (Date.now() - startTime < config.maxWaitTime) {
    if (await checkIfLoggedIn()) {
      console.log('Login detected!');
      clearInterval(qrRefreshInterval);
      if (currentQRUrl) {
        await deleteQRCode(currentQRUrl);
      }
      return true;
    }
  }
  throw new Error('Login timeout reached');
}

async function terminateService() {
  try {
    clearInterval(qrRefreshInterval);
    if (pageInstance) await pageInstance.close();
    if (browserInstance) await browserInstance.close();
    console.log('Service terminated');
    process.exit(0);
  } catch (error) {
    console.error('Termination error:', error.message);
    process.exit(1);
  }
}

app.listen(config.port, () => {
  console.log(`Service running on port ${config.port}`);
  initializeQRService();
});
